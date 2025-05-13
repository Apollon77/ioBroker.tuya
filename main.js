/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
let adapter;

const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Get common adapter utils
const mapper = require('./lib/mapper'); // Get common adapter utils
const dgram = require('dgram');
const {MessageParser, CommandType} = require('tuyapi/lib/message-parser.js');
const extend = require('extend');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');
let mitm;

const enhancedDpLogic = require('./lib/enhanced_logic.js');
const crypto = require('crypto');
const UDP_KEY_STRING = 'yGAdlopoPVldABfn';
const UDP_KEY = crypto.createHash('md5').update(UDP_KEY_STRING, 'utf8').digest();

let server;
let serverEncrypted;
let proxyServer;
let staticServer;
let proxyStopTimeout;
let proxyAdminMessageCallback;

const TuyaDevice = require('tuyapi');

const knownDevices = {};
const nodeToDeviceMap = {};
const deviceGroups = {};
let discoveredEncryptedDevices = {};
const valueHandler = {};
const enhancedValueHandler = {};
let connected = null;
let connectedCount = 0;
let adapterInitDone = false;
let AppCloud;
let appCloudApi = null;
const cloudDeviceGroups = {};
let cloudPollingTimeout = null;
const cloudGroupPollingTimeouts = {};
let cloudPollingErrorCounter = 0;
let cloudMqtt = null;
let lastMqttMessage = Date.now();
let isStopping = false;
let schemaCleanupInterval = null;
let Sentry;

function setConnected(isConnected) {
    if (!isConnected && (cloudMqtt || cloudPollingTimeout)){
        isConnected = true;
    }
    if (connected !== isConnected) {
        connected = isConnected;
        adapter && adapter.setState('info.connection', connected, true, (err) => {
            // analyse if the state could be set (because of permissions)
            if (err && adapter && adapter.log) adapter.log.warn(`Can not update connected state: ${err}`);
            else if (adapter && adapter.log) adapter.log.debug(`connected set to ${connected}`);
        });
    }
}

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: 'tuya'
    });
    adapter = new utils.Adapter(options);

    adapter.on('unload', function(callback) {
        isStopping = true;
        adapter.clearInterval(schemaCleanupInterval);
        try {
            if (cloudMqtt) {
                try {
                    cloudMqtt.stop();
                    cloudMqtt = null;
                } catch (err) {
                    adapter.log.error(`Cannot stop cloud mqtt: ${err}`);
                }
            }
            cloudPollingTimeout && clearTimeout(cloudPollingTimeout);
            for (const id in cloudGroupPollingTimeouts) {
                cloudGroupPollingTimeouts[id] && clearTimeout(cloudGroupPollingTimeouts[id]);
            }
            appCloudApi = null;
            stopAll();
            stopProxy();
            setConnected(false);
            // adapter.log.info('cleaned everything up...');
            setTimeout(callback, 3000);
        } catch (e) {
            callback();
        }
    });

    adapter.on('stateChange', function(id, state) {
        // Warning, state can be null if it was deleted
        adapter.log.debug(`stateChange ${id} ${JSON.stringify(state)}`);
        objectHelper.handleStateChange(id, state);
    });

    adapter.on('message', function(msg) {
        processMessage(msg);
    });

    adapter.on('ready', () => {
        if (adapter.supportsFeature && adapter.supportsFeature('PLUGINS')) {
            const sentryInstance = adapter.getPluginInstance('sentry');
            if (sentryInstance) {
                Sentry = sentryInstance.getSentryObject();
            }
        }
        main();
    });
    return adapter;
}

function stopAll() {
    if (server) {
        try {
            server.close();
        } catch (e) {
            // ignore
        }
    }
    server = null;
    if (serverEncrypted) {
        try {
            serverEncrypted.close();
        } catch (e) {
            // ignore
        }
    }
    serverEncrypted = null;
    if (proxyStopTimeout) {
        clearTimeout(proxyStopTimeout);
        proxyStopTimeout = null;
    }
    for (const deviceId in knownDevices) {
        if (!knownDevices.hasOwnProperty(deviceId)) continue;
        disconnectDevice(deviceId);
    }
}

async function initScenes() {
    if (!appCloudApi || !appCloudApi.groups) {
        return;
    }
    const allScenes = [];
    for (const group of appCloudApi.groups) {
        if (!appCloudApi) {
            return;
        }
        const scenes = await appCloudApi.getScenes(group.groupId);
        if (scenes && scenes.length) {
            scenes.forEach(scene => {
                scene.groupId = group.groupId;
            });
            allScenes.push(...scenes);
        }
    }
    if (allScenes.length) {
        objectHelper.setOrUpdateObject('scenes', {
            type: 'channel',
            common: {
                name: 'Scenes'
            }
        });
        allScenes.forEach(scene => {
            objectHelper.setOrUpdateObject(`scenes.${scene.id}`, {
                type: 'state',
                common: {
                    name: scene.name,
                    type: 'boolean',
                    role: 'button',
                    read: false,
                    write: true
                },
                native: scene
            }, false, async (value) => {
                if (!value) return;
                adapter.log.debug(`Scene ${scene.id} triggered`);
                try {
                    await appCloudApi.triggerScene(scene.groupId, scene.id);
                } catch (err) {
                    adapter.log.error(`Cannot trigger scene ${scene.id}: ${err.message}`);
                }
            });
        });
        return new Promise((resolve) => objectHelper.processObjectQueue(() => resolve()));
    }
}

function handleValueChangeCorrections(value, native) {
    if ((
        (native.code === 'TempSet' && native.id === 2) ||
        (native.code === 'TempCurrent' && native.id === 3) ||
        (native.code === 'floorTemp' && native.id === 102)) && native.property && native.property.step === 5) {
        value = value / 2;
    }
    return value
}

function handleSetValueCorrections(value, native) {
    if ((
        (native.code === 'TempSet' && native.id === 2) ||
        (native.code === 'TempCurrent' && native.id === 3) ||
        (native.code === 'floorTemp' && native.id === 102)) && native.property && native.property.step === 5) {
        value = value * 2;
    }
    return value
}

async function initDeviceGroups() {
    if (!appCloudApi || !appCloudApi.groups) {
        return;
    }
    for (const group of appCloudApi.groups) {
        if (!appCloudApi) return;
        const deviceGroupData = await appCloudApi.getGroupDeviceGroups(group.groupId);
        if (!deviceGroupData || !deviceGroupData.length) {
            continue;
        }
        for (const deviceGroup of deviceGroupData) {
            deviceGroups[deviceGroup.id] = deviceGroup;
            deviceGroups[deviceGroup.id].gid = group.groupId;
        }

        if (!appCloudApi) return;
        const deviceGroupRelationData = await appCloudApi.getGroupDeviceGroupRelations(group.groupId);
        if (!deviceGroupRelationData || !deviceGroupRelationData['5'] || !Array.isArray(deviceGroupRelationData['5'])) {
            continue;
        }
        deviceGroupRelationData['5'].forEach(relation => {
            const id = relation.id;
            const devicesInGroup = [];
            if (relation.children && relation.children['6'] && Array.isArray(relation.children['6'])) {
                relation.children['6'].forEach(child => devicesInGroup.push(child.id));
            }
            if (devicesInGroup.length && deviceGroups[id]) {
                deviceGroups[id].children = devicesInGroup;
            }
        });
    }
    if (!Object.keys(deviceGroups).length) {
        return;
    }

    objectHelper.setOrUpdateObject('groups', {
        type: 'channel',
        common: {
            name: 'groups'
        }
    });

    const preserveFields = ['name'];

    for (const devGroupId of Object.keys(deviceGroups)) {
        const deviceGroup = deviceGroups[devGroupId];
        const deviceGroupId = `groups.${deviceGroup.id}`;
        if (!deviceGroup.children || !deviceGroup.children.length) {
            continue;
        }

        const groupSchema = deviceGroup.productId ? mapper.getSchema(deviceGroup.productId) : null;
        let objs;
        if (groupSchema) {
            adapter.log.debug(`Devicegroup ${deviceGroupId}: Use following Schema for ${deviceGroup.productId}: ${JSON.stringify(groupSchema)}`);
            objs = mapper.getObjectsForSchema(groupSchema.schema, groupSchema.schemaExt, deviceGroup.dpName);
        } else {
            adapter.log.info(`Devicegroup ${deviceGroupId}: No schema exists, init basic states ...`);
            objs = mapper.getObjectsForData(deviceGroup.dps, true);
        }
        adapter.log.debug(`Devicegroup ${deviceGroupId}: Objects ${JSON.stringify(objs)}`);

        const dpIdList = [];
        const deviceWriteObjDetails = {};
        const values = deviceGroup.dps;

        objs.forEach((obj) => {
            const id = obj.id;
            dpIdList.push(parseInt(id, 10));
            delete obj.id;
            const native = obj.native;
            delete obj.native;
            let onChange;
            if (obj.write) {
                deviceWriteObjDetails[id] = obj;
                adapter.log.debug(`Devicegroup ${deviceGroupId} Register onChange for ${id}`);
                onChange = async (value) => {
                    /*adapter.log.debug(`Devicegroup ${deviceGroupId} onChange triggered for ${id} and value ${JSON.stringify(value)} - send to ${deviceGroup.children && deviceGroup.children.length} devices`);
                    if (deviceGroup.children && deviceGroup.children.length) {
                        for (const childId of deviceGroup.children) {
                            const stateId = `${adapter.namespace}.${childId}.${id}`;
                            objectHelper.handleStateChange(stateId, {val: value, ack: false});
                        }
                        pollDeviceGroup(deviceGroup.id, 5000);
                    }*/
                    if (!appCloudApi) return;

                    adapter.log.debug(`Devicegroup ${deviceGroupId} onChange triggered for ${id} and value ${JSON.stringify(value)} - set value via Cloud or group`);

                    if (obj.scale) {
                        value *= Math.pow(10, obj.scale);
                    } else if (obj.states) {
                        value = obj.states[value.toString()];
                    }
                    value = handleSetValueCorrections(value, native);

                    const dps = {};
                    dps[id] = value;
                    await appCloudApi.setDeviceGroupDps(deviceGroup.gid, deviceGroup.id, dps);
                    pollDeviceGroup(deviceGroup.id, 5000);
                    if (deviceGroup.children && deviceGroup.children.length) {
                        for (const childId of deviceGroup.children) {
                            pollDevice(childId, 5000);
                        }
                        pollDeviceGroup(deviceGroup.id, 5000);
                    }
                };
            }
            if (obj.scale) {
                valueHandler[`${deviceGroupId}.${id}`] = (value) => {
                    if (value === undefined) return undefined;
                    value = Math.floor(value * Math.pow(10, -obj.scale) * 100) / 100;
                    value = handleValueChangeCorrections(value, native);
                    return value;
                };
                values[id] = valueHandler[`${deviceGroupId}.${id}`](values[id]);
            } else if (obj.states) {
                valueHandler[`${deviceGroupId}.${id}`] = (value) => {
                    if (value === undefined) return undefined;
                    for (const key in obj.states) {
                        if (!obj.states.hasOwnProperty(key)) continue;
                        if (obj.states[key] === value) return parseInt(key);
                    }
                    adapter.log.warn(`Devicegroup ${deviceGroupId}.${id}: Value from device not defined in Schema: ${value}`);
                    return null;
                };
                values[id] = valueHandler[`${deviceGroupId}.${id}`](values[id]);
            }
            if (obj.encoding) {
                const dpEncoding = obj.encoding;
                if (!valueHandler[`${deviceGroupId}.${id}`]) {
                    valueHandler[`${deviceGroupId}.${id}`] = (value) => {
                        if (typeof value !== 'string') return value;
                        try {
                            switch (dpEncoding) {
                                case 'base64':
                                    let convertedValue = Buffer.from(value, 'base64').toString('ascii');
                                    if (convertedValue.match(/[^\x20-\x7E]+/g)) {
                                        convertedValue = value;
                                    }
                                    return convertedValue;
                                default:
                                    adapter.log.info(`Unsupported encoding ${dpEncoding} for ${deviceGroupId}.${id}`);
                                    return value;
                            }
                        } catch (err) {
                            adapter.log.info(`Error while decoding ${dpEncoding} for ${deviceGroupId}.${id}: ${err.message}`);
                            return value;
                        }
                    };
                    values[id] = valueHandler[`${deviceGroupId}.${id}`](values[id]);
                }
                delete obj.encoding;
            }
            if (!valueHandler[`${deviceGroupId}.${id}`]) {
                valueHandler[`${deviceGroupId}.${id}`] = (value) => {
                    if (obj.type === 'boolean') {
                        return (!value || value === 'false') ? false : true;
                    } else if (obj.type === 'number') {
                        value = handleValueChangeCorrections(value, native);
                        return parseFloat(value);
                    } else {
                        return value;
                    }
                };
            }
            objectHelper.setOrUpdateObject(`${deviceGroupId}.${id}`, {
                type: 'state',
                common: obj,
                native
            }, (deviceGroup.dpName && deviceGroup.dpName[id]) ? [] : preserveFields, values[id], onChange);

            let enhancedLogicList = enhancedDpLogic.getEnhancedLogic(id, native.code) || [];
            if (native && native.property && native.property.type === 'bitmap') {
                enhancedLogicList = [...enhancedLogicList, ...enhancedDpLogic.getBitmapLogic(id, native)];
            }
            if (enhancedLogicList) {
                enhancedLogicList.forEach((enhancedLogicData) => {
                    enhancedLogicData.common.read = obj.read;
                    enhancedLogicData.common.write = enhancedLogicData.common.write ? obj.write: enhancedLogicData.common.write;
                    enhancedLogicData.common.name = `${obj.name} ${enhancedLogicData.common.name}`;

                    const enhancedStateId = `${deviceGroupId}.${id}${enhancedLogicData.namePostfix}`;

                    let onEnhancedChange;
                    if (typeof enhancedLogicData.onValueChange === 'function') {
                        onEnhancedChange = async (value) => {
                            const dps = enhancedLogicData.onValueChange(value, true);
                            adapter.log.debug(`Devicegroup ${deviceGroupId} onChange triggered for ${enhancedStateId} and value ${JSON.stringify(value)} leading to dps ${JSON.stringify(dps)}`);
                            if (!dps) return;
                            for (const dpId of Object.keys(dps)) {
                                await adapter.setState(`${deviceGroupId}.${dpId}`, dps[dpId], false);
                            }
                        }
                    }
                    let enhancedValue = values[id];
                    if (typeof enhancedLogicData.onDpSet === 'function') {
                        enhancedValue = enhancedLogicData.onDpSet(enhancedValue, true);
                        enhancedValueHandler[`${deviceGroupId}.${id}`] = enhancedValueHandler[`${deviceGroupId}.${id}`] || {};
                        enhancedValueHandler[`${deviceGroupId}.${id}`][enhancedLogicData.namePostfix] = {
                            id: enhancedStateId,
                            handler: enhancedLogicData.onDpSet
                        };
                    }

                    objectHelper.setOrUpdateObject(enhancedStateId, {
                        type: 'state',
                        common: enhancedLogicData.common
                    }, (deviceGroup.dpName && deviceGroup.dpName[id]) ? [] : preserveFields, enhancedValue, onEnhancedChange);
                });
            }
        });

        deviceGroup.groupSchema = groupSchema;
        deviceGroup.dpIdList = dpIdList;
        objectHelper.setOrUpdateObject(deviceGroupId, {
            type: 'device',
            common: {
                name: deviceGroup.name || `Group ${deviceGroup.id}`
            },
            native: deviceGroup
        }, deviceGroup.name ? preserveFields : undefined);

    }
    return new Promise((resolve) => objectHelper.processObjectQueue(() => {
        for (const deviceGroupId of Object.keys(deviceGroups)) {
            //pollDeviceGroup(deviceGroupId, adapter.config.cloudPollingInterval * Math.random() + 5);
        }
        resolve();
    }));
}

async function sendLocallyOrCloud(deviceId, physicalDeviceId, id, value, forceCloud, noPolling) {
    let dps = {};
    if (id === 'multiple') {
        dps = value;
    } else {
        dps[id] = value;
    }

    if (!knownDevices[physicalDeviceId]) return null;

    if (forceCloud !== true && knownDevices[physicalDeviceId].device && knownDevices[physicalDeviceId].connected) {
        try {
            const res = await knownDevices[physicalDeviceId].device.set({
                cid: knownDevices[deviceId].cid,
                multiple: true,
                data: dps,
                devId: deviceId
            });
            adapter.log.debug(`${deviceId}.${id}: set value ${JSON.stringify(value)} via ${physicalDeviceId} (Local): res=${JSON.stringify(res)}`);
            if (!noPolling) {
                pollDevice(deviceId, 2000);
                pollDevice(physicalDeviceId, 2000);
            }
            return res;
        } catch (err) {
            adapter.log.warn(`${deviceId}.${id}: ${err.message}.${appCloudApi ? ' Try to use cloud.' : ''}`);
        }
    }
    if (appCloudApi && forceCloud !== false) {
        try {
            const res = await appCloudApi.set(cloudDeviceGroups[physicalDeviceId], deviceId, physicalDeviceId, dps);
            adapter.log.debug(`${deviceId}.${id}: set value ${JSON.stringify(value)} via ${physicalDeviceId} (Cloud): res=${JSON.stringify(res)}`);
            if (!noPolling) {
                scheduleCloudGroupValueUpdate(cloudDeviceGroups[physicalDeviceId], 2000);
            }
            return res;
        } catch (err) {
            adapter.log.warn(`${deviceId}.${id}: set value ${value} via ${physicalDeviceId} (Cloud) failed: ${err.code} - ${err.message}`);
            if (!noPolling) {
                scheduleCloudGroupValueUpdate(cloudDeviceGroups[physicalDeviceId], 2000);
            }
        }
    } else {
        adapter.log.info(`${deviceId} Sending command failed: Local Device communication not initialized and cloud unavailable ...`);
    }
    return null;
}

async function initDeviceObjects(deviceId, data, objs, values, preserveFields) {
    if (!values) {
        values = {};
    }
    if (!preserveFields) {
        preserveFields = [];
    }
    const dpIdList = [];
    const physicalDeviceId = data.meshId || deviceId;

    if (data.infraRed && data.infraRed.keyData && data.infraRed.keyData.keyCodeList) {
        data.infraRed.keyData.keyCodeList.forEach(keyData => {
            const onChange = async (value) => {
                adapter.log.debug(`${deviceId} onChange triggered for ir-${keyData.key} and value ${JSON.stringify(value)}`);
                if (!value) return;

                if (data.dpCodes && data.dpCodes['ir_send']) {
                    // postData: {"devId":"bf781b021b60e971f5fvka","dps":"{\"201\":\"{\\\"control\\\":\\\"send_ir\\\",\\\"head\\\":\\\"010e0400000000000600100020003000620c4b0c5b\\\",\\\"key1\\\":\\\"002%#000490#000D0010#000100@^\\\",\\\"type\\\":0,\\\"delay\\\":300}\"}","gwId":"bf90851a27705b2de3rwll"}
                    const keyArr = keyData.compressPulse.split(':');
                    const irData = {
                        control: 'send_ir',
                        head: data.infraRed.keyData.head,
                        'key1': '0' + keyArr[0],
                        type: 0,
                        delay: 300
                    };

                    // To send the head/key format locally we need to send it to the physical device
                    await sendLocallyOrCloud(physicalDeviceId, physicalDeviceId, data.dpCodes['ir_send'].id, JSON.stringify(irData), undefined, true);
                } else if (data.dpCodes && data.dpCodes['control'] && data.dpCodes['key_code'] && data.dpCodes['ir_code'] && data.dpCodes['type'] && data.dpCodes['delay_time']) {
                    const keyArr = keyData.compressPulse.split(':');
                    const dps = {};
                    dps[data.dpCodes['control'].id.toString()] = 'send_ir';
                    dps[data.dpCodes['key_code'].id.toString()] = keyArr[0];
                    dps[data.dpCodes['ir_code'].id.toString()] = data.infraRed.keyData.head;
                    dps[data.dpCodes['type'].id.toString()] = 0;
                    dps[data.dpCodes['delay_time'].id.toString()] = 300;

                    await sendLocallyOrCloud(physicalDeviceId, physicalDeviceId, 'multiple', dps, undefined, true);
                }
            };
            const keyId = keyData.key.replace(adapter.FORBIDDEN_CHARS, '_').replace(/[ +]/g, '_');
            objectHelper.setOrUpdateObject(`${deviceId}.ir-${keyId}`, {
                type: 'state',
                common: {
                    name: keyData.keyName || keyData.key,
                    type: 'boolean',
                    role: 'button',
                    write: true,
                    read: false,
                },
                native: keyData
            }, preserveFields, false, onChange);

        });
    }
    const deviceWriteObjDetails = {};
    objs.forEach((obj) => {
        const id = obj.id;
        dpIdList.push(parseInt(id, 10));
        delete obj.id;
        const native = obj.native;
        delete obj.native;
        let onChange;
        if (!data.localKey && !data.meshId) {
            obj.write = false;
        }
        if (obj.write) {
            deviceWriteObjDetails[id] = obj;
            adapter.log.debug(`${deviceId} Register onChange for ${id}`);
            onChange = async (value) => {
                adapter.log.debug(`${deviceId} onChange triggered for ${id} and value ${JSON.stringify(value)}`);

                if (obj.scale) {
                    value *= Math.pow(10, obj.scale);
                } else if (obj.states) {
                    value = obj.states[value.toString()];
                }
                value = handleSetValueCorrections(value, native);

                const parentDpList = knownDevices[physicalDeviceId] && knownDevices[physicalDeviceId].dpIdList || [];
                let sendViaCloud;
                if (data.meshId && data.infraRed && data.infraRed.keyData && data.infraRed.keyData.keyCodeList && !parentDpList.includes(id)) {
                    sendViaCloud = true;
                }
                await sendLocallyOrCloud(deviceId, physicalDeviceId, id, value, sendViaCloud);
            };
        }
        if (obj.scale) {
            valueHandler[`${deviceId}.${id}`] = (value) => {
                if (value === undefined) return undefined;
                value = Math.floor(value * Math.pow(10, -obj.scale) * 100) / 100;
                value = handleValueChangeCorrections(value, native);
                return value;
            };
        } else if (obj.states) {
            valueHandler[`${deviceId}.${id}`] = (value) => {
                if (value === undefined) return undefined;
                for (const key in obj.states) {
                    if (!obj.states.hasOwnProperty(key)) continue;
                    if (obj.states[key] === value) return parseInt(key);
                }
                adapter.log.warn(`${deviceId}.${id}: Value from device not defined in Schema: ${value}`);
                return null;
            };
        }
        if (obj.encoding) {
            const dpEncoding = obj.encoding;
            if (!valueHandler[`${deviceId}.${id}`]) {
                valueHandler[`${deviceId}.${id}`] = (value) => {
                    if (typeof value !== 'string') return value;
                    try {
                        switch (dpEncoding) {
                            case 'base64':
                                let convertedValue = Buffer.from(value, 'base64').toString('ascii');
                                if (convertedValue.match(/[^\x20-\x7E]+/g)) {
                                    convertedValue = value;
                                }
                                return convertedValue;
                            default:
                                adapter.log.info(`Unsupported encoding ${dpEncoding} for ${deviceId}.${id}`);
                                return value;
                        }
                    } catch (err) {
                        adapter.log.info(`Error while decoding ${dpEncoding} for ${deviceId}.${id}: ${err.message}`);
                        return value;
                    }
                };
            }
            delete obj.encoding;
        }
        if (!valueHandler[`${deviceId}.${id}`] && obj.type === 'number') {
            valueHandler[`${deviceId}.${id}`] = (value) => handleValueChangeCorrections(value, native);
        }
        if (valueHandler[`${deviceId}.${id}`]) {
            values[id] = valueHandler[`${deviceId}.${id}`](values[id]);
            adapter.log.debug(`Corrected value: ${values[id]}`);
        }
        objectHelper.setOrUpdateObject(`${deviceId}.${id}`, {
            type: 'state',
            common: obj,
            native
        }, (data.dpName && data.dpName[id]) ? [] : preserveFields, values[id], onChange);

        let enhancedLogicList = enhancedDpLogic.getEnhancedLogic(id, native.code) || [];
        if (native && native.property && native.property.type === 'bitmap') {
            enhancedLogicList = [...enhancedLogicList, ...enhancedDpLogic.getBitmapLogic(id, native)];
        }
        if (enhancedLogicList) {
            enhancedLogicList.forEach((enhancedLogicData) => {
                enhancedLogicData.common.read = obj.read;
                enhancedLogicData.common.write = enhancedLogicData.common.write ? obj.write: enhancedLogicData.common.write;
                enhancedLogicData.common.name = `${obj.name} ${enhancedLogicData.common.name}`;

                const enhancedStateId = `${deviceId}.${id}${enhancedLogicData.namePostfix}`;

                let onEnhancedChange;
                if (typeof enhancedLogicData.onValueChange === 'function') {
                    onEnhancedChange = async (value) => {
                        const dps = enhancedLogicData.onValueChange(value);
                        adapter.log.debug(`${deviceId} onChange triggered for ${enhancedStateId} and value ${JSON.stringify(value)} leading to dps ${JSON.stringify(dps)}`);
                        if (!dps) return;
                        for (const dpId of Object.keys(dps)) {
                            await adapter.setState(`${deviceId}.${dpId}`, dps[dpId], false);
                        }
                    }
                }
                let enhancedValue = values[id];
                if (typeof enhancedLogicData.onDpSet === 'function') {
                    enhancedValue = enhancedLogicData.onDpSet(enhancedValue);
                    enhancedValueHandler[`${deviceId}.${id}`] = enhancedValueHandler[`${deviceId}.${id}`] || {};
                    enhancedValueHandler[`${deviceId}.${id}`][enhancedLogicData.namePostfix] = {
                        id: enhancedStateId,
                        handler: enhancedLogicData.onDpSet
                    };
                }

                objectHelper.setOrUpdateObject(enhancedStateId, {
                    type: 'state',
                    common: enhancedLogicData.common
                }, (data.dpName && data.dpName[id]) ? [] : preserveFields, enhancedValue, onEnhancedChange);
            });
        }
    });

    if (!data.meshId && data.dpCodes && (
        (data.dpCodes['ir_send'] && data.dpCodes['ir_study_code']) || // 201/202 case
        (data.dpCodes['control'] && data.dpCodes['study_code'] && data.dpCodes['key_code'] && data.dpCodes['ir_code'] && data.dpCodes['type'] && data.dpCodes['delay_time']) // 1..13 case
    ) && (!data.infraRed || !data.infraRed.keyData)) {
        // IR Main device
        objectHelper.setOrUpdateObject(`${deviceId}.ir-learn`, {
            type: 'state',
            common: {
                name: 'Learn IR Code',
                type: 'boolean',
                role: 'button',
                write: true,
                read: false
            }
        }, preserveFields, false, async (value) => {
            if (!value) return;
            adapter.log.debug(`${deviceId} Learn IR Code`);
            if (data.dpCodes['ir_send']) {
                // Exit study mode in case it's enabled
                await sendLocallyOrCloud(deviceId, physicalDeviceId, data.dpCodes['ir_send'].id, '{"control": "study_exit"}', undefined, true);
                await sendLocallyOrCloud(deviceId, physicalDeviceId, data.dpCodes['ir_send'].id, '{"control": "study"}', undefined, true);
                // Result will be in DP 202 when received
            } else if (data.dpCodes['control'] && data.dpCodes['key_code'] && data.dpCodes['ir_code'] && data.dpCodes['type'] && data.dpCodes['delay_time']) {
                // Exit study mode in case it's enabled
                await sendLocallyOrCloud(deviceId, physicalDeviceId, data.dpCodes['control'].id, 'study_exit', undefined, true);
                await sendLocallyOrCloud(deviceId, physicalDeviceId, data.dpCodes['control'].id, 'study', undefined, true);
                // Result will be in DP 2 when received
            }
        });
        objectHelper.setOrUpdateObject(`${deviceId}.ir-send`, {
            type: 'state',
            common: {
                name: 'Send IR Code',
                type: 'string',
                role: 'value',
                write: true,
                read: false
            }
        }, preserveFields, '', async (value) => {
            if (!value) return;
            adapter.log.debug(`${deviceId} Send IR Code: ${value} with Type-Prefix 1`);
            value = value.toString();
            if (data.dpCodes['ir_send']) {
                const irData = {
                    control: 'send_ir',
                    head: '',
                    'key1': '1' + value,
                    type: 0,
                    delay: 300,
                };
                await sendLocallyOrCloud(physicalDeviceId, physicalDeviceId, data.dpCodes['ir_send'].id, JSON.stringify(irData), undefined, true);
            } else if (data.dpCodes['control'] && data.dpCodes['key_study']) {
                const dps = {};
                dps[data.dpCodes['control'].id.toString()] = 'study_key';
                dps[data.dpCodes['key_study'].id.toString()] = value;
                dps[data.dpCodes['type'].id.toString()] = 0;

                await sendLocallyOrCloud(physicalDeviceId, physicalDeviceId, 'multiple', dps, undefined, true);
            }
        });
    }
    return dpIdList;
}

function pollDevice(deviceId, overwriteDelay) {
    if (!knownDevices[deviceId] || knownDevices[deviceId].stop) return;
    if (!knownDevices[deviceId].dpIdList || !knownDevices[deviceId].dpIdList.length) return;
    if (overwriteDelay && (!knownDevices[deviceId].connected || knownDevices[deviceId].noLocalConnection)) {
        scheduleCloudGroupValueUpdate(cloudDeviceGroups[deviceId], overwriteDelay);
        return;
    }
    if (!overwriteDelay) {
        overwriteDelay = adapter.config.pollingInterval * 1000;
    }
    if (knownDevices[deviceId].pollingTimeout) {
        clearTimeout(knownDevices[deviceId].pollingTimeout);
        knownDevices[deviceId].pollingTimeout = null;
    }
    knownDevices[deviceId].pollingTimeout = setTimeout(async () => {
        knownDevices[deviceId].pollingTimeout = null;

        const physicalDeviceId = knownDevices[deviceId].data.meshId || deviceId;
        if (knownDevices[physicalDeviceId] && knownDevices[physicalDeviceId].device) {
            if (knownDevices[physicalDeviceId].useRefreshToGet && knownDevices[physicalDeviceId].dpIdList) {
                const cleanedDpIdList = knownDevices[physicalDeviceId].dpIdList.filter(dpId => dpId !== 201 && dpId !== 202);
                try {
                    if (!knownDevices[physicalDeviceId].refreshDpList) {
                        knownDevices[physicalDeviceId].refreshDpList = knownDevices[physicalDeviceId].dpIdList.filter(el => knownDevices[physicalDeviceId].device._dpRefreshIds.includes(el));
                    }
                    if (knownDevices[physicalDeviceId].refreshDpList.length) {
                        adapter.log.debug(`${deviceId} request data via refresh for ${JSON.stringify(knownDevices[physicalDeviceId].refreshDpList)}`);
                        knownDevices[physicalDeviceId].waitingForRefresh = true;
                        const data = await knownDevices[physicalDeviceId].device.refresh({
                            cid: knownDevices[deviceId].cid,
                            requestedDPS: knownDevices[physicalDeviceId].refreshDpList
                        });
                        knownDevices[physicalDeviceId].waitingForRefresh = false;
                        adapter.log.debug(`${deviceId} response from refresh: ${JSON.stringify(data)}`);
                        knownDevices[physicalDeviceId].device.emit('dp-refresh', {dps: data});
                    }
                    else if (cleanedDpIdList.length) {
                        adapter.log.debug(`${deviceId} request data via set-refresh for ${JSON.stringify(knownDevices[physicalDeviceId].dpIdList)}`);
                        const data = await knownDevices[physicalDeviceId].device.set({
                            cid: knownDevices[deviceId].cid,
                            dps: cleanedDpIdList,
                            set: null
                        });
                        adapter.log.debug(`${deviceId} response from set-refresh: ${JSON.stringify(data)}`);
                        // adapter.log.debug(deviceId + ' polling not supported');
                    }
                } catch (err) {
                    adapter.log.debug(`${deviceId} error on refresh: ${err.message}`);
                }
            } else {
                try {
                    adapter.log.debug(`${deviceId} request data via get ...`);
                    await knownDevices[physicalDeviceId].device.get({
                        cid: knownDevices[deviceId].cid,
                        returnAsEvent: true
                    });
                } catch(err) {
                    adapter.log.warn(`${deviceId} error on get: ${err.message}`);
                }
            }
        }
        pollDevice(deviceId);
    }, overwriteDelay);
}

function pollDeviceGroup(deviceGroupId, overwriteDelay) {
    if (!deviceGroups[deviceGroupId]) return;
    if (!appCloudApi) {
        adapter.log.warn(`Device group ${deviceGroupId} cannot be polled because cloud API is not available`);
        return;
    }
    if (!overwriteDelay) {
        overwriteDelay = adapter.config.cloudPollingInterval * 1000;
    }
    if (deviceGroups[deviceGroupId].pollingTimeout) {
        clearTimeout(deviceGroups[deviceGroupId].pollingTimeout);
        deviceGroups[deviceGroupId].pollingTimeout = null;
    }
    deviceGroups[deviceGroupId].pollingTimeout = setTimeout(async () => {
        deviceGroups[deviceGroupId].pollingTimeout = null;
        if (!appCloudApi) {
            adapter.log.warn(`Device group ${deviceGroupId} cannot be polled because cloud API is not available`);
            return;
        }

        const groupData = await appCloudApi.getDeviceGroupData(deviceGroups[deviceGroupId].gid, deviceGroupId);
        if (!groupData || !Array.isArray(groupData)) {
            adapter.log.warn(`Cannot get data for device group ${deviceGroupId}`);
            return;
        }
        adapter.log.debug(`Got data for device group ${deviceGroupId}: ${JSON.stringify(groupData)}`);
        for (const dpData of groupData) {
            const id = dpData.dpId;
            let value = dpData.value;
            if (!deviceGroups[deviceGroupId].dpIdList.includes(parseInt(id, 10))) {
                adapter.log.info(`Group ${deviceGroupId}: Unknown datapoint ${id} with value ${value}. Please resync devices`);
                continue;
            }
            const deviceGroupStateId = `groups.${deviceGroupId}.${id}`;
            if (valueHandler[deviceGroupStateId]) {
                value = valueHandler[deviceGroupStateId](value);
            }
            adapter.setState(deviceGroupStateId, value, true);
            if (enhancedValueHandler[deviceGroupStateId]) {
                for (const subId of Object.keys(enhancedValueHandler[deviceGroupStateId])) {
                    const enhancedValue = enhancedValueHandler[deviceGroupStateId][subId].handler(value, true);
                    adapter.setState(enhancedValueHandler[deviceGroupStateId][subId].id, enhancedValue, true);
                }
            }
        }
        pollDeviceGroup(deviceGroupId);
    }, overwriteDelay);
}

function handleReconnect(deviceId, delay) {
    if (!knownDevices[deviceId]) return;
    delay = delay || 30000;
    if (knownDevices[deviceId].reconnectTimeout) {
        clearTimeout(knownDevices[deviceId].reconnectTimeout);
        knownDevices[deviceId].reconnectTimeout = null;
    }
    if (knownDevices[deviceId].stop) return;
    knownDevices[deviceId].reconnectTimeout = setTimeout(() => {
        if (!knownDevices[deviceId].device) {
            return;
        }
        knownDevices[deviceId].device.connect().catch(err => {
            knownDevices[deviceId].errorcount++;
            if (!cloudMqtt && !appCloudApi) {
                adapter.log.warn(`${deviceId}: Error on Reconnect (${knownDevices[deviceId].errorcount}): ${err.message}`);
            } else  {
                adapter.log.info(`${deviceId}: Error on Reconnect (${knownDevices[deviceId].errorcount}): ${err.message}`);
            }
            handleReconnect(deviceId, knownDevices[deviceId].errorcount < 6 ? (knownDevices[deviceId].errorcount * 10000) : 60000);
        });
    }, delay);
}

function connectDevice(deviceId, callback) {
    if (!knownDevices[deviceId].meshId) { // only devices without a meshId are real devices
        if (knownDevices[deviceId].noLocalConnection) {
            callback && callback();
            return;
        }
        if (!knownDevices[deviceId].ip) {
            return void checkDiscoveredEncryptedDevices(deviceId, callback);
        }
        if (knownDevices[deviceId].version) {
            discoveredEncryptedDevices[knownDevices[deviceId].ip] = true;
        }
        if (knownDevices[deviceId].device) {
            if (!knownDevices[deviceId].connected) {
                handleReconnect(deviceId, 1000);
            }
            callback && callback();
            return;
        }
        adapter.log.info(`${deviceId} Init with IP=${knownDevices[deviceId].ip}, Key=${knownDevices[deviceId].localKey}, Version=${knownDevices[deviceId].version}`);
        knownDevices[deviceId].stop = false;
        knownDevices[deviceId].device = new TuyaDevice({
            id: deviceId,
            key: knownDevices[deviceId].localKey || '0000000000000000',
            ip: knownDevices[deviceId].ip,
            version: knownDevices[deviceId].version,
            nullPayloadOnJSONError: true
        });

        const handleNewData = async (data) => {
            knownDevices[deviceId].errorcount = 0;
            if (typeof data !== 'object' || !data || !data.dps) return;
            adapter.log.debug(`${deviceId}: Received data: ${JSON.stringify(data)}`);

            if (knownDevices[deviceId].deepCheckNextData) {
                const dataKeys = Object.keys(data.dps);
                const dummyFieldList = ["1", "2", "3", "101", "102", "103"];
                if (dataKeys.length === dummyFieldList.length && !dataKeys.find(key => !dummyFieldList.includes(key) || data.dps[key] !== null)) {
                    // {"1":null,"2":null,"3":null,"101":null,"102":null,"103":null}
                    adapter.log.debug(`${deviceId}: Ignore invalid data (Counter: ${knownDevices[deviceId].deepCheckNextData})`);
                    knownDevices[deviceId].deepCheckNextData--;
                    return;
                }
            }

            if (!knownDevices[deviceId].objectsInitialized) {
                adapter.log.info(`${deviceId}: No schema exists, init basic states ...`);
                knownDevices[deviceId].dpIdList = await initDeviceObjects(deviceId, data, mapper.getObjectsForData(data.dps, !!knownDevices[deviceId].localKey), data.dps, ['name']);
                knownDevices[deviceId].objectsInitialized = true;
                objectHelper.processObjectQueue();
                return;
            }

            let deviceIdToSet = deviceId;
            if (data.cid && !knownDevices[deviceId].meshId) {
                if (!nodeToDeviceMap[deviceId]) {
                    adapter.log.info(`${deviceId}: Received data for node ${data.cid} for unexpected device. Please resync devices`);
                    deviceIdToSet = null;
                } else if (!nodeToDeviceMap[deviceId][data.cid]) {
                    adapter.log.info(`${deviceId}: Received data for unknown node ${data.cid}. Please resync devices`);
                    deviceIdToSet = null;
                } else {
                    deviceIdToSet = nodeToDeviceMap[deviceId][data.cid];
                    adapter.log.debug(`${deviceId}: Set values on ${deviceIdToSet} for cid ${data.cid}`);
                }
            }

            if (deviceIdToSet && knownDevices[deviceIdToSet]) {
                for (const id in data.dps) {
                    if (!data.dps.hasOwnProperty(id)) continue;
                    let value = data.dps[id];
                    if (
                        !knownDevices[deviceIdToSet].dpIdList ||
                        !knownDevices[deviceIdToSet].dpIdList.includes(parseInt(id, 10))
                    ) {
                        adapter.log.info(`${deviceIdToSet}: Unknown datapoint ${id} with value ${value}. Please resync devices`);
                        continue;
                    }
                    if (valueHandler[`${deviceIdToSet}.${id}`]) {
                        value = valueHandler[`${deviceIdToSet}.${id}`](value);
                    }
                    adapter.setState(`${deviceIdToSet}.${id}`, value, true);
                    if (enhancedValueHandler[`${deviceIdToSet}.${id}`]) {
                        for (const subId of Object.keys(enhancedValueHandler[`${deviceIdToSet}.${id}`])) {
                            const enhancedValue = enhancedValueHandler[`${deviceIdToSet}.${id}`][subId].handler(value);
                            adapter.setState(enhancedValueHandler[`${deviceIdToSet}.${id}`][subId].id, enhancedValue, true);
                        }
                    }
                }
            }
            pollDevice(deviceIdToSet); // lets poll in defined interval
        };

        knownDevices[deviceId].device.on('data', handleNewData);
        knownDevices[deviceId].device.on('dp-refresh', handleNewData);

        knownDevices[deviceId].device.on('connected', () => {
            adapter.log.debug(`${deviceId}: Connected to device`);
            adapter.setState(`${deviceId}.online`, true, true);
            if (knownDevices[deviceId].reconnectTimeout) {
                clearTimeout(knownDevices[deviceId].reconnectTimeout);
                knownDevices[deviceId].reconnectTimeout = null;
            }
            knownDevices[deviceId].connected = true;
            connectedCount++;
            if (!connected) setConnected(true);
            pollDevice(deviceId, 1000);
        });

        knownDevices[deviceId].device.on('disconnected', () => {
            adapter.log.debug(`${deviceId}: Disconnected from device`);
            if (knownDevices[deviceId].waitingForRefresh) {
                knownDevices[deviceId].waitingForRefresh = false;
                //knownDevices[deviceId].useRefreshToGet = false;
                //adapter.log.debug(`${deviceId}: ... seems like Refresh not supported ... disable`);
                // TODO check once such a case comes up
            }
            adapter.setState(`${deviceId}.online`, false, true);
            if (!knownDevices[deviceId].stop) {
                if (knownDevices[deviceId].pollingTimeout) {
                    clearTimeout(knownDevices[deviceId].pollingTimeout);
                    knownDevices[deviceId].pollingTimeout = null;
                }
                handleReconnect(deviceId);
            }
            if (knownDevices[deviceId].connected) {
                knownDevices[deviceId].connected = false;
                connectedCount--;
            }
            if (connected && connectedCount === 0) setConnected(false);
        });

        knownDevices[deviceId].device.on('error', (err) => {
            adapter.log.debug(`${deviceId}: Error from device (${knownDevices[deviceId].errorcount}): App still open on your mobile phone? ${err}`);

            if (err === 'json obj data unvalid') {
                // Special error case!
                knownDevices[deviceId].deepCheckNextData = knownDevices[deviceId].deepCheckNextData || 0;
                knownDevices[deviceId].deepCheckNextData++;
                if (knownDevices[deviceId].useRefreshToGet === undefined) {
                    knownDevices[deviceId].useRefreshToGet = true;
                    pollDevice(deviceId, 100); // next try with refresh
                }
            }

            if (knownDevices[deviceId].errorcount > 5) {
                disconnectDevice(deviceId);
            }
        });

        knownDevices[deviceId].device.connect().catch(err => {
            knownDevices[deviceId].errorcount++;
            if (!cloudMqtt && !appCloudApi) {
                adapter.log.warn(`${deviceId}: Error on connect (${knownDevices[deviceId].errorcount}): ${err.message}`);
            } else  {
                adapter.log.info(`${deviceId}: Error on connect (${knownDevices[deviceId].errorcount}): ${err.message}`);
            }
            handleReconnect(deviceId, knownDevices[deviceId].errorcount < 6 ? (knownDevices[deviceId].errorcount * 10000) : 60000);
        });

        if (!knownDevices[deviceId].localKey) {
            adapter.log.info(`${deviceId}: No local encryption key available, get data using polling, controlling of device NOT possible. Please sync with App!`);
            pollDevice(deviceId);
        }
    }
    callback && callback();
}

function disconnectDevice(deviceId) {
    knownDevices[deviceId].stop = true;
    if (knownDevices[deviceId].device) {
        knownDevices[deviceId].device.disconnect();
        knownDevices[deviceId].device = null;
    }
    if (knownDevices[deviceId].reconnectTimeout) {
        clearTimeout(knownDevices[deviceId].reconnectTimeout);
        knownDevices[deviceId].reconnectTimeout = null;
    }
    if (knownDevices[deviceId].pollingTimeout) {
        clearTimeout(knownDevices[deviceId].pollingTimeout);
        knownDevices[deviceId].pollingTimeout = null;
    }
    if (discoveredEncryptedDevices[knownDevices[deviceId].ip] && !knownDevices[deviceId].noLocalConnection) {
        delete discoveredEncryptedDevices[knownDevices[deviceId].ip];
    }
}

async function initDevice(deviceId, productKey, data, preserveFields, fromDiscovery, callback, retry) {
    if (!preserveFields) {
        preserveFields = [];
    }

    if (knownDevices[deviceId] && knownDevices[deviceId].device && fromDiscovery) {
        adapter.log.debug(`${deviceId}: Device already connected`);
        if (callback) {
            setImmediate(callback);
        }
        return;
    }

    if (knownDevices[deviceId] && knownDevices[deviceId].waitForDisconnect) {
        adapter.log.debug(`${deviceId}: Device is waiting for disconnect`);
        if (callback) {
            setImmediate(callback);
        }
        return;
    }

    if (knownDevices[deviceId] && !fromDiscovery && (
        knownDevices[deviceId].device ||
        knownDevices[deviceId].connected ||
        knownDevices[deviceId].reconnectTimeout ||
        knownDevices[deviceId].pollingTimeout
    )) {
        disconnectDevice(deviceId);
        if (retry) {
            adapter.log.info(`${deviceId}: Device still connected for re-init - skip init now`);
            if (callback) {
                setImmediate(callback);
            }
            return;
        }
        knownDevices[deviceId].waitForDisconnect = true;
        return new Promise(resolve => setTimeout(() => {
            knownDevices[deviceId].waitForDisconnect = false;
            initDevice(deviceId, productKey, data, preserveFields, fromDiscovery, () => {
                callback && callback();
                resolve();
            }, true)
        }, 1000));
    } else if (knownDevices[deviceId] && fromDiscovery) {
        // Make finally sure to end all timeouts
        disconnectDevice(deviceId);
    }

    data.productKey = productKey;
    let values;
    if (data.dps) {
        values = data.dps;
        delete data.dps;
    }
    // {"ip":"192.168.178.85","gwId":"34305060807d3a1d7178","active":2,"ability":0,"mode":0,"encrypt":true,"productKey":"8FAPq5h6gdV51Vcr","version":"3.1"}
    if (!data.schema) {
        const known = mapper.getSchema(productKey);
        adapter.log.debug(`${deviceId}: Use following Schema for ${productKey}: ${JSON.stringify(known)}`);
        if (known) {
            data.schema = known.schema;
            data.schemaExt = known.schemaExt;
        }
    }

    /*if (knownDevices[deviceId] && knownDevices[deviceId].device && data.localKey === knownDevices[deviceId].localKey) {
        adapter.log.debug(`${deviceId}: Device already connected and localKey did not changed`);
        if (callback) {
            callback();
        }
        return;
    }*/

    knownDevices[deviceId] = extend(true, {}, knownDevices[deviceId] || {}, {
        'data': data
    });
    knownDevices[deviceId].errorcount = 0;
    adapter.log.debug(`${deviceId}: Init device with data (after merge): ${JSON.stringify(knownDevices[deviceId])}`);

    if (!fromDiscovery) {
        const stateIp = await adapter.getStateAsync(`${deviceId}.ip`);
        if (stateIp && stateIp.val) {
            const ipVal = stateIp.val.toString().trim();
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipVal) && ipVal !== data.ip) {
                adapter.log.debug(`${deviceId}: IP changed from ${data.ip} to ${ipVal}`);
                data.ip = ipVal;
            }
        }
    }

    if (!data.localKey) {
        data.localKey = knownDevices[deviceId].localKey || '';
    }
    else {
        knownDevices[deviceId].localKey = data.localKey;
    }
    if (!data.version) {
        data.version = knownDevices[deviceId].version || '';
    }
    else {
        knownDevices[deviceId].version = data.version;
    }
    if (data.ip) {
        knownDevices[deviceId].ip = data.ip;
    }
    if (!data.name) {
        data.name = knownDevices[deviceId].name || '';
    }
    else {
        knownDevices[deviceId].name = data.name;
    }
    if (data.meshId) {
        knownDevices[deviceId].meshId = data.meshId;
    }
    if (knownDevices[deviceId].meshId) {
        if (data.cid !== undefined) {
            knownDevices[deviceId].cid = data.cid;
        } else if (data.otaInfo && data.otaInfo.otaModuleMap && data.deviceTopo && data.deviceTopo.nodeId) {
            let gwType;
            if (data.otaInfo.otaModuleMap.zigbee) {
                gwType = 'Zigbee';
            } else if (data.otaInfo.otaModuleMap.subpieces) {
                gwType = 'Subpieces/Wifi';
            } else {
                gwType = 'Unknown';
            }
            adapter.log.debug(`${deviceId}: Initialize cid "${data.deviceTopo.nodeId}" for Sub-${gwType} device via parent ${knownDevices[deviceId].meshId}`);
            data.cid = data.deviceTopo.nodeId;
            knownDevices[deviceId].cid = data.cid;
        }
        if (knownDevices[deviceId].cid) {
            nodeToDeviceMap[knownDevices[deviceId].meshId] = nodeToDeviceMap[knownDevices[deviceId].meshId] || {};
            nodeToDeviceMap[knownDevices[deviceId].meshId][knownDevices[deviceId].cid] = deviceId;
        }
    }

    if (data.useRefreshToGet && knownDevices[deviceId].useRefreshToGet === undefined) {
        knownDevices[deviceId].useRefreshToGet = data.useRefreshToGet;
    }

    if (data.schema && data.meshId) {
        if (data.otaInfo && data.otaInfo.otaModuleMap && data.otaInfo.otaModuleMap.infrared && appCloudApi) {
            try {
                const infraredRecord = await appCloudApi.getInfraredRecord(cloudDeviceGroups[deviceId], deviceId, data.meshId, data.meshId, '3');

                const infraRedKeyData = await appCloudApi.getInfraredKeydata(cloudDeviceGroups[deviceId], deviceId, data.meshId, infraredRecord.devTypeId, infraredRecord.vender, infraredRecord.remoteId);

                data.infraRed = {
                    record: infraredRecord,
                    keyData: infraRedKeyData
                }
            } catch (err) {
                adapter.log.error(`${deviceId}: Error while getting IR codes: ${err.message}`);
            }
        }
    }

    adapter.log.debug(`${deviceId}: Create device objects if not exist`);
    objectHelper.setOrUpdateObject(deviceId, {
        type: 'device',
        common: {
            name: knownDevices[deviceId].name || `Device ${deviceId}`
        },
        native: data
    }, knownDevices[deviceId].name ? preserveFields : undefined);
    !data.meshId && objectHelper.setOrUpdateObject(`${deviceId}.online`, {
        type: 'state',
        common: {
            name: 'Local connection status',
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false
        }
    }, false);
    !data.meshId && objectHelper.setOrUpdateObject(`${deviceId}.ip`, {
        type: 'state',
        common: {
            name: 'Device IP',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: true
        }
    }, data.ip, value => {
        value = (value || '').toString().trim();
        if (!value || !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)) {
            adapter.log.warn(`${deviceId}: Invalid IP address set to ip state: ${value}`);
            return;
        }
        if (!knownDevices[deviceId] || (knownDevices[deviceId] && knownDevices[deviceId].ip === value)) return;
        if (knownDevices[deviceId] && knownDevices[deviceId].connected) {
            adapter.log.warn(`${deviceId}: Device is connected to ${knownDevices[deviceId].ip} but IP state is set to ${value}. Ignoring.`);
            adapter.setState(`${deviceId}.ip`, knownDevices[deviceId].ip, true);
            return;
        }
        knownDevices[deviceId].ip = value;
        adapter.extendObject(deviceId, {
            native: {
                ip: value
            }
        });
        adapter.setState(`${deviceId}.ip`, value, true);
        if (knownDevices[deviceId] && !knownDevices[deviceId].noLocalConnection) {
            disconnectDevice(deviceId);
            connectDevice(deviceId);
        }
    });
    data.meshId && objectHelper.setOrUpdateObject(`${deviceId}.meshParent`, {
        type: 'state',
        common: {
            name: 'Mesh ID of parent device',
            type: 'string',
            role: 'info.address',
            read: true,
            write: false
        }
    }, data.meshId);
    !data.meshId && objectHelper.setOrUpdateObject(`${deviceId}.noLocalConnection`, {
        type: 'state',
        common: {
            name: 'Do not connect locally to this device',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
            def: false
        }
    }, value => {
        knownDevices[deviceId].noLocalConnection = !!value;
        adapter.log.info(`${deviceId}: ${value ? 'Device will not be connected locally' : 'Trying to connect locally to the device'}`);
        if (knownDevices[deviceId].noLocalConnection) {
            disconnectDevice(deviceId);
        }
        else {
            if (knownDevices[deviceId].device) {
                handleReconnect(deviceId, 500);
            }
            else {
                connectDevice(deviceId);
            }
        }
        adapter.setState(`${deviceId}.noLocalConnection`, !!value, true);
    });

    if (data.schema) {
        if (Array.isArray(data.schema)) {
            data.dpCodes = {};
            data.schema.forEach((def) => {
                data.dpCodes[def.code] = def;
            });
        }
        const objs = mapper.getObjectsForSchema(data.schema, data.schemaExt, data.dpName);
        adapter.log.debug(`${deviceId}: Objects ${JSON.stringify(objs)}`);
        knownDevices[deviceId].dpIdList = await initDeviceObjects(deviceId, data, objs, values, preserveFields);
        knownDevices[deviceId].objectsInitialized = true;
    }

    objectHelper.processObjectQueue(async () => {
        const noLocalConnectionState = await adapter.getStateAsync(`${deviceId}.noLocalConnection`);
        knownDevices[deviceId].noLocalConnection = noLocalConnectionState && !!noLocalConnectionState.val;
        adapter.log.info(`${deviceId}: ${knownDevices[deviceId].noLocalConnection ? 'Do not connect' : 'Connect'} locally to device`);

        connectDevice(deviceId, callback);
    });
}


function discoverLocalDevices() {
    server = dgram.createSocket('udp4');
    server.on('listening', function () {
        //const address = server.address();
        adapter.log.info('Listen for local Tuya devices on port 6666');
    });
    const normalParser = new MessageParser({version: 3.1});
    server.on('message', async (message, remote) => {
        adapter.log.debug(`Discovered device: ${remote.address}:${remote.port} - ${message}`);
        let data;
        try {
            data = normalParser.parse(message)[0];
        } catch (err) {
            return;
        }
        if (!data.payload || !data.payload.gwId || data.commandByte !== CommandType.UDP) return;
        if (knownDevices[data.payload.gwId] && knownDevices[data.payload.gwId].device && !knownDevices[data.payload.gwId].reconnectTimeout) return;
        await initDevice(data.payload.gwId, data.payload.productKey, data.payload, ['name'], true);
    });
    server.on('error', err => {
        adapter.log.warn(`Can not Listen for Encrypted UDP packages: ${err}`);
    });
    server.bind(6666);

    serverEncrypted = dgram.createSocket('udp4');

    serverEncrypted.on('listening', () => {
        //const address = server.address();
        adapter.log.info('Listen for encrypted local Tuya devices on port 6667');
    });
    serverEncrypted.on('message',  (message, remote) =>  {
        if (!discoveredEncryptedDevices[remote.address]) {
            adapter.log.debug(`Discovered encrypted device and store for later usage: ${remote.address}:${remote.port} - ${message.toString('hex')}`);
            discoveredEncryptedDevices[remote.address] = message;

            // try to auto init devices when known already by using proxy
            if (adapterInitDone) {
                for (let deviceId of Object.keys(knownDevices)) {
                    if (!knownDevices[deviceId].localKey || knownDevices[deviceId].device) continue;
                    checkDiscoveredEncryptedDevices(deviceId).catch(err => adapter.log.warn(`Error on auto init encrypted device: ${err.message}`));
                }
            }
        }
    });
    serverEncrypted.on('error', err => {
        adapter.log.warn(`Can not Listen for Encrypted UDP packages: ${err}`);
    });
    serverEncrypted.bind(6667);
}

async function checkDiscoveredEncryptedDevices(deviceId, callback) {
    const foundIps = Object.keys(discoveredEncryptedDevices);
    adapter.log.debug(`${deviceId}: Try to initialize encrypted device with received UDP messages (#IPs: ${foundIps.length}): version=${knownDevices[deviceId].version}, key=${knownDevices[deviceId].localKey}`);
    const parser = new MessageParser({version: knownDevices[deviceId].version || 3.3, key: knownDevices[deviceId].localKey});
    const parserDefault = new MessageParser({version: knownDevices[deviceId].version || 3.3, key: UDP_KEY});

    for (let ip of foundIps) {
        if (discoveredEncryptedDevices[ip] === true) continue;

        let data;
        // try Default Key
        try {
            data = parserDefault.parse(discoveredEncryptedDevices[ip])[0];
        }
        catch (err) {
            adapter.log.debug(`${deviceId}: Error on default decrypt try: ${err.message}`);
        }
        if (!data || !data.payload || !data.payload.gwId || (data.commandByte !== CommandType.UDP && data.commandByte !== CommandType.UDP_NEW && data.commandByte !== CommandType.BOARDCAST_LPV34)) {
            adapter.log.debug(`${deviceId}: No relevant Data for default decrypt try: ${JSON.stringify(data)}`);

            // try device key
            try {
                data = parser.parse(discoveredEncryptedDevices[ip])[0];
            }
            catch (err) {
                adapter.log.debug(`${deviceId}: Error on device decrypt try: ${err.message}`);
                continue;
            }
            if (!data || !data.payload || !data.payload.gwId || (data.commandByte !== CommandType.UDP && data.commandByte !== CommandType.UDP_NEW)) {
                adapter.log.debug(`${deviceId}: No relevant Data for device decrypt try: ${JSON.stringify(data)}`);
                continue;
            }
        }
        if (data.payload.gwId === deviceId) {
            discoveredEncryptedDevices[data.payload.ip] = true;
            await initDevice(data.payload.gwId, data.payload.productKey, data.payload, ['name'], true, callback);
            return true;
        }
    }
    adapter.log.debug(`${deviceId}: None of the discovered devices matches :-(`);
    callback && callback();
}

async function syncDevicesWithAppCloud() {
    let adapterRestartPlanned = false;
    adapter.log.info("Try to sync devices from Cloud using stored cloud credentials");
    appCloudApi = await cloudLogin(adapter.config.cloudUsername, adapter.config.cloudPassword, adapter.config.region, adapter.config.appType, adapter.config.appDeviceId, adapter.config.appSessionId, adapter.config.appRegion, adapter.config.appEndpoint, (cloudApi, lastLoginResult) => {
        adapter.log.info("Cloud login successful. Adapter restarts in 5s");
        adapterRestartPlanned = true;
        if ((!adapter.config.appDeviceId && cloudApi.deviceID) || (!adapter.config.appSessionId && cloudApi.sid) || (adapter.config.appSessionId && adapter.config.appSessionId !== cloudApi.sid)) {
            adapter.extendForeignObject(`system.adapter.${adapter.namespace}`, {
                native: {
                    appDeviceId: cloudApi.deviceID,
                    appSessionId: cloudApi.sid,
                    appRegion: cloudApi.region,
                    appEndpoint: cloudApi.endpoint,
                    appPhoneCode: lastLoginResult ? lastLoginResult.phoneCode: null,
                }
            });
            adapter.log.info(`Set data for ${adapter.namespace} to appDeviceId=${cloudApi.deviceID} / sid=${cloudApi.sid}. Restart adapter now!`);
        }
    });
    if (appCloudApi) {
        if (adapterRestartPlanned) {
            return;
        }

        try {
            await receiveCloudDevices(appCloudApi);
        } catch (err) {
            adapter.log.error(`Error to receive cloud devices: ${err.message}`);
        }
        if (adapterRestartPlanned) {
            return;
        }
        adapter.log.debug('Initial cloud device sync done');

        if (cloudMqtt) {
            try {
                cloudMqtt.stop();
            } catch (err) {
                adapter.log.error(`Error while stopping Cloud MQTT: ${err.message}`);
            }
            cloudMqtt = null;
        }
        try {
            cloudMqtt = await connectMqtt();
        } catch (err) {
            adapter.log.error(`Error to connect to Cloud MQTT: ${err.message}`);
        }
        if (cloudMqtt) {
            adapter.log.info(`Cloud MQTT connection established successfully.`);
        }

        if (adapter.config.cloudPollingWhenNotConnected) {
            adapter.log.debug('Initialize App CLoud Device Polling for unconnected devices ...');
            cloudPollingTimeout = setTimeout(() => {
                cloudPollingTimeout = null;
                updateValuesFromCloud();
            }, adapter.config.cloudPollingInterval * 1000);
        }

    } else {
        adapter.log.warn("App cloud connection failed. No sync possible");
    }
}

async function initDone() {
    adapter.log.info('Existing devices initialized');
    discoverLocalDevices();
    adapter.subscribeStates('*');
    discoveredEncryptedDevices = {}; // Clean discovered devices to reset auto-detection
    adapterInitDone = true;
    if (adapter.config.cloudUsername && adapter.config.cloudPassword) {
        await syncDevicesWithAppCloud();
        await initScenes();
        await initDeviceGroups();
    }

    // Cleanup loaded schemas because need a lot of ram, and simply do every 10 minutes if new devices were handled silently
    mapper.clearLoadedSchemas();
    schemaCleanupInterval = adapter.setInterval(() => mapper.clearLoadedSchemas(), 60 * 60 * 1000);
}

function processMessage(msg) {
    adapter.log.debug(`Message: ${JSON.stringify(msg)}`);
    switch (msg.command) {
        case 'startProxy':
            startProxy(msg);
            break;
        case 'cloudSync':
            cloudSync(msg).catch(err => adapter.log.warn(`Error on cloudSync: ${err.message}`));
            break;
        case 'stopProxy':
            stopProxy(msg);
            break;
        case 'getProxyResult':
            getProxyResult(msg);
            break;
        case 'getDeviceInfo':
            getDeviceInfo(msg);
            break;
    }
}

async function cloudSync(msg) {
    adapter.log.info("Try to sync devices from Cloud using cloud credentials from Admin");
    try {
        const cloudSyncApi = await cloudLogin(msg.message.cloudUsername, msg.message.cloudPassword, msg.message.region, msg.message.appType);
        if (cloudSyncApi) {
            proxyAdminMessageCallback = msg;
            await receiveCloudDevices(cloudSyncApi);
        } else {
            adapter.sendTo(msg.from, msg.command, {
                error: 'Login failed',
            }, msg.callback);
        }
    } catch (err) {
        adapter.sendTo(msg.from, msg.command, {
            error: `Failed getting cloud Devices: ${err.message}`,
        }, msg.callback);
    }
}

function startProxy(msg) {
    const ifaces = os.networkInterfaces();
    let ownIp;
    for (const eth in ifaces) {
        if (!ifaces.hasOwnProperty(eth)) continue;
        for (let num = 0; num < ifaces[eth].length; num++) {
            if (ifaces[eth][num].family !== 'IPv6' && ifaces[eth][num].family !== 6 && ifaces[eth][num].address !== '127.0.0.1' && ifaces[eth][num].address !== '0.0.0.0') {
                ownIp = ifaces[eth][num].address;
                adapter.log.debug(`Use first network interface (${ownIp})`);
                break;
            }
        }
        if (ownIp) break;
    }

    if (!proxyServer) {
        msg.message.proxyPort = parseInt(msg.message.proxyPort, 10);
        if (isNaN(msg.message.proxyPort) || msg.message.proxyPort < 1024 || msg.message.proxyPort > 65535) {
            adapter.log.warn('Invalid port set for Proxy. Reset to 8888');
            msg.message.proxyPort = 8888;
        }
        msg.message.proxyWebPort = parseInt(msg.message.proxyWebPort, 10);
        if (isNaN(msg.message.proxyWebPort) || msg.message.proxyWebPort < 1024 || msg.message.proxyWebPort > 65535) {
            adapter.log.warn('Invalid port set for Proxy web port. Reset to 8889');
            msg.message.proxyWebPort = 8889;
        }

        const configPath = path.join(utils.getAbsoluteDefaultDataDir(), adapter.namespace.replace('.', '_'));
        const certPath = path.join(configPath, 'certs/ca.pm');
        const checkerFilePath = path.join(configPath, 'checker');
        if (fs.existsSync(configPath)) {
            try {
                const certStat = fs.statSync(certPath);
                if ((certStat && Date.now() - certStat.ctimeMs > 90 * 24 * 60 * 60 * 1000) || !fs.existsSync(checkerFilePath)) { // > 90d
                    fs.removeSync(configPath);
                    fs.mkdirSync(configPath);
                    fs.writeFileSync(checkerFilePath, '1');
                    adapter.log.info(`Proxy certificates recreated. You need to load the new certificate!`);
                }
            } catch (err) {
                adapter.log.info(`Could not check/recreate proxy certificates: ${err.message}`);
            }
        } else {
            fs.mkdirSync(configPath);
            fs.writeFileSync(checkerFilePath, '1');
        }

        // Create proxy server
        proxyServer = mitm();

        proxyServer.onRequest((ctx, callback) => {
            ctx.onResponse(function(ctx, callback) {
                ctx.proxyToServerRequest.socket.once('close', () => {
                    ctx.clientToProxyRequest.socket.destroy()
                });
                return callback();
            });

            if (ctx.clientToProxyRequest.headers && ctx.clientToProxyRequest.headers.host && ctx.clientToProxyRequest.headers.host.includes('tuya')) {
                const chunks = [];
                ctx.onResponseData(function(ctx, chunk, callback) {
                    chunks.push(chunk);
                    return callback(null, chunk);
                });
                ctx.onResponseEnd(function(ctx, callback) {
                    const body = Buffer.concat(chunks).toString('utf-8');

                    if (body.includes('tuya.m.my.group.device.list')) {
                        let response;
                        try {
                            response = JSON.parse(body);
                        }
                        catch (err) {
                            adapter.log.debug(`SSL-Proxy: error checking response: ${err.message}`);
                            adapter.log.debug(body);
                        }
                        catchProxyInfo(response).catch(err => adapter.log.warn(`Error on catchProxyInfo: ${err.message}`));
                    }
                    else if (body.startsWith('{') && body.includes('"result":')) {
                        let response;
                        try {
                            response = JSON.parse(body);
                        }
                        catch (err) {
                            response = null;
                        }
                        if (response && response.result && typeof response.result === 'string') {
                            adapter.log.warn('It seems that you use an unsupported App version of Tuya App! Please see Admin Infos and GitHub Readme for details!');
                        }
                    }
                    return callback();
                });
            }

            return callback();
        });

        proxyServer.onError((ctx, err) => {
            adapter.log.warn(`SSL-Proxy ERROR: ${err}`);
            adapter.log.warn(err.stack);
        });

        proxyServer.listen({
            port: msg.message.proxyPort,
            sslCaDir: configPath,
            keepAlive: true
        }, () => {
            // Create server for downloading certificate
            const serve = serveStatic(path.join(configPath, 'certs'), {});

            // Create server
            staticServer = http.createServer((req, res) => {
                serve(req, res, finalhandler(req, res));
            });

            staticServer.on('error', err => {
                adapter.log.warn(`SSL-Proxy could not be started: ${err}`);
                adapter.log.warn(err.stack);
            });

            // Listen
            staticServer.listen(msg.message.proxyWebPort, () => {
                adapter.log.info('SSL-Proxy ready to receive requests');
                let QRCode;
                try {
                    QRCode = require('qrcode');
                }
                catch (e) {
                    QRCode = null;
                }
                if (QRCode) {
                    let qrCodeCert;
                    const certUrl = `http://${ownIp}:${msg.message.proxyWebPort}/ca.pem`;
                    QRCode.toDataURL(certUrl).then((url) => {
                        qrCodeCert = url;
                        adapter.sendTo(msg.from, msg.command, {
                            result: {
                                qrcodeCert: qrCodeCert,
                                certUrl
                            },
                            error: null
                        }, msg.callback);
                        proxyStopTimeout = setTimeout(() => {
                            if (proxyServer) {
                                proxyServer.close();
                                staticServer && staticServer.close();
                                proxyServer = null;
                                staticServer = null;
                            }
                        }, 600000);
                    }).catch(err => {
                        console.error(err.message);
                    });
                }
                else {
                    adapter.sendTo(msg.from, msg.command, {
                        result: {
                            qrcodeCert: 'Not existing'
                        },
                        error: null
                    }, msg.callback);
                    proxyStopTimeout = setTimeout(() => {
                        if (proxyServer) {
                            proxyServer.close();
                            staticServer && staticServer.close();
                            proxyServer = null;
                            staticServer = null;
                        }
                    }, 600000);
                }
            });
        });

    }
    else {
        clearTimeout(proxyStopTimeout);
        proxyStopTimeout = setTimeout(() => {
            if (proxyServer) {
                proxyServer.close();
                staticServer && staticServer.close();
                proxyServer = null;
                staticServer = null;
            }
        }, 300000);
        adapter.sendTo(msg.from, msg.command, {
            result:     {
                success: true
            },
            error:      null
        }, msg.callback);
    }
}

function stopProxy(msg) {
    if (proxyServer) {
        try {
            proxyServer.close();
        } catch (e) {
            // ignore
        }
        proxyServer = null;
        try {
            staticServer.close();
        } catch (e) {
            // ignore
        }
        staticServer = null;
    }
    if (msg && adapter) {
        adapter.sendTo(msg.from, msg.command, {
            result: true,
            error: null
        }, msg.callback);
    }
}

async function catchProxyInfo(data) {
    if (!data || !data.result || !Array.isArray(data.result)) return;

    let devices = [];
    let deviceInfos = [];

    adapter.log.debug(`Process found devices: ${JSON.stringify(data.result)}`);
    data.result.forEach((obj) => {
        if (obj.a === 'tuya.m.my.group.device.list') {
            devices = obj.result;
        }
        else if (obj.a === 'tuya.m.device.ref.info.my.list') {
            deviceInfos = obj.result;
        }
    });


    if (deviceInfos && deviceInfos.length) {
        adapter.log.debug(`Found ${deviceInfos.length} device schema information`);
        deviceInfos.forEach((deviceInfo) => {
            if (mapper.addSchema(deviceInfo.id, deviceInfo.schemaInfo)) {
                if (!Sentry) {
                    adapter.log.info(`New Schema added for product type ${deviceInfo.id}. Please send next line from logfile on disk to developer! Or consider activating Sentry for automatic reporting.`);
                    adapter.log.info(JSON.stringify(deviceInfo.schemaInfo));
                } else {
                    Sentry.withScope(scope => {
                        scope.setLevel('info');
                        scope.setExtra("schema", `"${deviceInfo.id}": ${JSON.stringify(deviceInfo.schemaInfo)}`);
                        Sentry.captureMessage(`Schema ${deviceInfo.id}`, 'info');
                    });
                }
            }
        });
    }
    else {
        deviceInfos = [];
    }

    if (devices && devices.length) {
        adapter.log.debug(`Found ${devices.length} devices`);
        for (const device of devices) {
            delete device.ip;
            device.schema = false;
            await initDevice(device.devId, device.productId, device);
            /*
            {
                "devId": "34305060807d3a1d7832",
                "dpMaxTime": 1540200260064,
                "virtual": false,
                "productId": "8FAPq5h6gdV51Vcr",
                "dps": {
                    "1": false,
                    "2": 0,
                    "3": 1,
                    "4": 0,
                    "5": 0,
                    "6": 2399
                },
                "activeTime": 1539967915,
                "ip": "91.89.163.25",
                "lon": "8.345706",
                "moduleMap": {
                    "wifi": {
                        "upgradeStatus": 0,
                        "bv": "5.27",
                        "cdv": "1.0.0",
                        "pv": "2.1",
                        "verSw": "1.0.1",
                        "isOnline": true,
                        "id": 2952706,
                        "cadv": ""
                    },
                    "mcu": {
                        "upgradeStatus": 0,
                        "cdv": "",
                        "verSw": "1.0.1",
                        "isOnline": true,
                        "id": 2952707,
                        "cadv": ""
                    }
                },
                "uuid": "34305060807d3a1d7832",
                "name": "Steckdose 1",
                "timezoneId": "Europe/Berlin",
                "iconUrl": "https://images.tuyaus.com/smart/icon/1521522457nf46uh6z3tk3jag1m6bfq1tt9_0.jpg",
                "lat": "49.035754",
                "runtimeEnv": "prod",
                "localKey": "03c5e7d3b8c97ec0"
            }
            */
        }
    }
    else {
        devices = [];
    }
    if (proxyAdminMessageCallback) {
        console.log('send ... ... ... ...');
        adapter.sendTo(proxyAdminMessageCallback.from, proxyAdminMessageCallback.command, {
            result:     {
                schemaCount: deviceInfos.length,
                deviceCount: devices.length
            },
            error:      null
        }, proxyAdminMessageCallback.callback);
        proxyAdminMessageCallback = null;
    }
}

function getProxyResult(msg) {
    proxyAdminMessageCallback = msg;

    // To simulate a successfull response ...
    /*
    if (proxyAdminMessageCallback) {
        console.log('send ... ... ... ...');
        adapter.sendTo(proxyAdminMessageCallback.from, proxyAdminMessageCallback.command, {
            result:     {
                schemaCount: 1,
                deviceCount: 2
            },
            error:      null
        }, proxyAdminMessageCallback.callback);
        proxyAdminMessageCallback = null;
    }
    */
}

function getDeviceInfo(msg) {
    let devices = 0;
    let devicesConnected = 0;
    let devicesWithSchema = 0;
    let devicesWithLocalKey = 0;

    for (const deviceId in knownDevices) {
        if (!knownDevices.hasOwnProperty(deviceId)) continue;

        devices++;
        if (knownDevices[deviceId].device) devicesConnected++;
        if (knownDevices[deviceId].localKey) devicesWithLocalKey++;
        if (knownDevices[deviceId].data.schema) devicesWithSchema++;
    }
    adapter.sendTo(msg.from, msg.command, {
        result:     {
            devices: devices,
            devicesConnected: devicesConnected,
            devicesWithLocalKey: devicesWithLocalKey,
            devicesWithSchema: devicesWithSchema
        },
        error:      null
    }, msg.callback);

}

async function cloudLogin(username, password, region, appType, appDeviceId, appSessionId, appRegion, appEndpoint, loginCallback) {
    if (!AppCloud) {
        AppCloud = require('./lib/appcloud');
    }

    let cloudInstance;
    try {
        cloudInstance = new AppCloud(username, password, region, appType, appDeviceId, appSessionId, appRegion, appEndpoint, loginCallback);
    } catch (err) {
        adapter.log.error(`Error creating cloud API: ${err.message}`);
        return null;
    }
    if (appSessionId) {
        try {
            adapter.log.debug(`Try to reuse existing session id: ${appSessionId}`);
            await cloudInstance.getLocationList();
            if (appSessionId !== cloudInstance.cloudApi.sid) {
                adapter.log.debug(`Session id changed to ${cloudInstance.cloudApi.sid}`);
            } else {
                adapter.log.debug(`Session id is still valid`);
            }
            return cloudInstance;
        } catch (err) {
            adapter.log.error(`Error reusing existing session id: ${err.message}`);
            adapter.log.debug(`Session id ${appSessionId} is not valid anymore. Try to login again`);
            appSessionId = null;
        }
    }

    try {
        const sid = await cloudInstance.login();
        adapter.log.debug(`Cloud sid: ${sid} for Device-ID ${cloudInstance.cloudApi.deviceID}`);

        return cloudInstance;
    } catch (err) {
        adapter.log.error(`Cloud login failed: ${err.message}`);
        adapter.log.error('Please check your cloud credentials in the adapter configuration!');
        return null;
    }
}

async function receiveCloudDevices(cloudApiInstance, onlyNew) {
    const groups = await cloudApiInstance.getLocationList();
    cloudApiInstance.groups = groups;
    let deviceList = [];
    let deviceListInfo = [];
    for (const group of groups) {
        try {
            const resultDevices = await cloudApiInstance.getGroupDevices(group.groupId);
            resultDevices.forEach(device => {
                if (device.dataPointInfo) {
                    if (device.dataPointInfo.dps) {
                        device.dps = device.dataPointInfo.dps;
                    }
                    if (device.dataPointInfo.dpName) {
                        device.dpName = device.dataPointInfo.dpName;
                    }
                }
                if (device.communication && device.communication.communicationNode && device.communication.communicationNode !== device.devId) {
                    device.meshId = device.communication.communicationNode;
                }
                device.groudId = group.groupId;
            });
            deviceList = [...deviceList, ...resultDevices];
            for (const device of resultDevices) {
                if (onlyNew && knownDevices[device.devId]) continue;
                cloudDeviceGroups[device.devId] = group.groupId;
            }
        } catch (err) {
            adapter.log.warn(`Error fetching device list for group ${group.groupId}: ${err}`);
        }
        try {
            const resultInfo = await cloudApiInstance.getGroupSchemas(group.groupId);
            deviceListInfo = [...deviceListInfo, ...resultInfo];
        } catch (err) {
            adapter.log.error(`Error fetching device info for group ${group.groupId}: ${err}`);
        }
    }

    await catchProxyInfo({
        result: [
            {
                a: 'tuya.m.my.group.device.list',
                success: true,
                v: '1.0',
                status: 'ok',
                result: deviceList,
            },
            {
                a: 'tuya.m.device.ref.info.my.list',
                success: true,
                v: '2.0',
                status: 'ok',
                result: deviceListInfo,
            },
        ],
    });
}

function scheduleCloudGroupValueUpdate(groupId, delay) {
    if (cloudGroupPollingTimeouts[groupId]) {
        clearTimeout(cloudGroupPollingTimeouts[groupId]);
    }
    cloudGroupPollingTimeouts[groupId] = setTimeout(() => updateValuesFromCloud(groupId), delay);
}

async function updateValuesFromCloud(groupId, retry = false) {
    if (cloudMqtt) {
        const differenceSinceLastMqttMessage = Date.now() - lastMqttMessage;
        if (differenceSinceLastMqttMessage <= adapter.config.cloudPollingInterval * 1000) {
            cloudPollingTimeout = setTimeout(() => {
                cloudPollingTimeout = null;
                updateValuesFromCloud();
            }, adapter.config.cloudPollingInterval * 1000);
            return;
        } else if (differenceSinceLastMqttMessage < 24 * 60 * 60 * 1000) {
            adapter.log.debug(`Use app cloud polling because last MQTT update was ${Math.floor(differenceSinceLastMqttMessage / (1000 * 60))} mins ago.`);
        } else {
            adapter.log.info(`Use app cloud polling because last MQTT update was ${Math.floor(differenceSinceLastMqttMessage / (1000 * 60 * 60))} hours ago. Please check your Tuya IoT Cloud status that no service is expired.`);
        }
    }
    if (typeof groupId === 'boolean') {
        retry = groupId;
        groupId = undefined;
    }
    const groups = [];
    if (groupId === undefined) {
        Object.keys(cloudDeviceGroups).forEach(devId => {
            if (knownDevices[devId] && !knownDevices[devId].connected && knownDevices[devId].objectsInitialized) {
                const groupId = cloudDeviceGroups[devId];
                if (!groups.includes(groupId)) {
                    groups.push(groupId);
                }
            }
        });
    } else {
        groups.push(groupId);
    }
    if (groups.length === 0) {
        adapter.log.debug('No devices to update from cloud');
        cloudPollingTimeout = setTimeout(() => {
            cloudPollingTimeout = null;
            updateValuesFromCloud();
        }, adapter.config.cloudPollingInterval * 1000);
        return;
    }
    let deviceList = [];
    let errorsThisRun = 0;
    for (const groupId of groups) {
        try {
            const resultDevices = await appCloudApi.getGroupDevices(groupId);
            resultDevices.forEach(device => {
                if (device.dataPointInfo) {
                    if (device.dataPointInfo.dps) {
                        device.dps = device.dataPointInfo.dps;
                    }
                    if (device.dataPointInfo.dpName) {
                        device.dpName = device.dataPointInfo.dpName;
                    }
                }
                if (device.communication && device.communication.communicationNode && device.communication.communicationNode !== device.devId) {
                    device.meshId = device.communication.communicationNode;
                }
                device.groudId = groupId;
            });
            deviceList = [...deviceList, ...resultDevices];
        } catch (err) {
            adapter.log.warn(`Error fetching device list for group ${groupId}: ${err}`);
            errorsThisRun++;
        }
    }
    adapter.log.debug(`Received ${deviceList.length} devices from cloud: ${JSON.stringify(deviceList)}`);
    for (const device of deviceList) {
        const deviceId = device.devId;
        if (knownDevices[deviceId] && !knownDevices[deviceId].connected && knownDevices[deviceId].dpIdList && knownDevices[deviceId].dpIdList.length) {
            for (const id in device.dps) {
                if (!device.dps.hasOwnProperty(id)) continue;
                let value = device.dps[id];
                if (!knownDevices[deviceId].dpIdList.includes(parseInt(id, 10))) {
                    adapter.log.info(`${deviceId}: Unknown datapoint ${id} with value ${value}. Please resync devices`);
                    continue;
                }
                if (valueHandler[`${deviceId}.${id}`]) {
                    value = valueHandler[`${deviceId}.${id}`](value);
                }
                adapter.setState(`${deviceId}.${id}`, value, true);
                if (enhancedValueHandler[`${deviceId}.${id}`]) {
                    for (const subId of Object.keys(enhancedValueHandler[`${deviceId}.${id}`])) {
                        const enhancedValue = enhancedValueHandler[`${deviceId}.${id}`][subId].handler(value);
                        adapter.setState(enhancedValueHandler[`${deviceId}.${id}`][subId].id, enhancedValue, true);
                    }
                }
            }
        }
    }
    if (groupId !== undefined) {
        return;
    }
    cloudPollingErrorCounter += errorsThisRun;
    if (retry && errorsThisRun > 0) {
        adapter.log.error(`Cloud polling failed ${errorsThisRun} times, even after a relogin. Disabling cloud polling.`);
        return;
    }
    if (errorsThisRun === 0) {
        cloudPollingErrorCounter = 0;
    }
    if (cloudPollingErrorCounter > 10) {
        adapter.log.error('Too many errors while updating devices from cloud, try a relogin');
        appCloudApi = await cloudLogin(adapter.config.username, adapter.config.password, adapter.config.region, adapter.config.appType, adapter.config.appDeviceId, adapter.config.appSessionId, adapter.config.appRegion, adapter.config.appEndpoint);
        if (appCloudApi) {
            await updateValuesFromCloud(true);
        } else {
            adapter.log.error('Relogin failed, disabling cloud polling');
        }
        return;
    }
    cloudPollingTimeout = setTimeout(() => {
        cloudPollingTimeout = null;
        updateValuesFromCloud();
    }, adapter.config.cloudPollingInterval * 1000);
}

async function connectMqtt() {
    if (!adapter.config.iotCloudAccessId || !adapter.config.iotCloudAccessSecret) {
        adapter.log.info('IOT Cloud ID/Secret not configured, disabling real time State updates from Cloud MQTT');
        return null;
    }

    const TuyaSHOpenAPI = require('./lib/tuya/lib/tuyashopenapi');
    const TuyaOpenMQ = require('./lib/tuya/lib/tuyamqttapi');

    let appSchema = 'smartLife'; // default
    switch (adapter.config.appType) {
        case 'tuya_smart':
            appSchema = 'tuyaSmart';
            break;
        case 'ledvance':
            appSchema = 'ledvance';
            break;
        case 'sylvania':
            appSchema = 'sylvania';
            break;
    }

    const api = new TuyaSHOpenAPI(
        adapter.config.iotCloudAccessId,
        adapter.config.iotCloudAccessSecret,
        adapter.config.cloudUsername,
        adapter.config.cloudPassword,
        adapter.config.appPhoneCode || 49,
        appSchema,
        {log: adapter.log.debug.bind(this)},
    );

    try {
        await api._refreshAccessTokenIfNeed('/');
    } catch (err) {
        adapter.log.error(`Login for MQTT failed: ${err}`);
        return;
    }

    /*
    try {
        devices = await api.getDevices()
    } catch (e) {
        // this.log.log(JSON.stringify(e.message));
        adapter.log.debug('Failed to get device information. Please check if the config.json is correct.')
        return;
    }
    */

    const type = '1.0'; // config.options.projectType == "1" ? "2.0" : "1.0"
    const cloudMqtt = new TuyaOpenMQ(api, type, {log: adapter.log.debug.bind(this)});
    cloudMqtt.addMessageListener(onMQTTMessage);
    try {
        cloudMqtt.start();
    } catch (err) {
        adapter.log.error(`MQTT connection failed: ${err.message}`);
        adapter.log.error('MQTT connection disabled');
        return null;
    }
    cloudPollingTimeout && clearTimeout(cloudPollingTimeout);
    return cloudMqtt;
}

//Handle device deletion, addition, status update
async function onMQTTMessage(message) {
    if (isStopping) return;
    lastMqttMessage = Date.now();
    if (message.bizCode && message.bizData) {
        // {"bizCode":"nameUpdate","bizData":{"devId":"34305060807d3a1d7832","uid":"eu1539013901029biqMB","name":"Steckdose irgendwo"},"devId":"34305060807d3a1d7832","productKey":"8FAPq5h6gdV51Vcr","ts":1667689855956,"uuid":"34305060807d3a1d7832"}
        if (message.bizCode === 'nameUpdate') {
            const devId = message.devId;
            const name = message.bizData.name;
            if (knownDevices[devId]) {
                adapter.log.info(`Device ${devId} got renamed to "${name}"`);
                knownDevices[devId].name = name;
                adapter.extendObject(devId, {
                    common: {
                        name,
                    },
                    native: {
                        name,
                    }
                });
            }
        } else if (message.bizCode === 'dpNameUpdate') {
            // "message": {"bizCode":"dpNameUpdate","bizData":{"devId":"7815006550029108eb50","name":"Tanne Vitrine","dpId":"3"},"devId":"7815006550029108eb50","productKey":"gl5fdiv1tc9mkvlp","ts":1668105513574,"uuid":"7815006550029108eb50"}
            const devId = message.devId;
            const dpId = message.bizData.dpId;
            const name = message.bizData.name;
            if (knownDevices[devId]) {
                adapter.log.info(`State ${devId}.${dpId} got renamed to "${name}"`);
                const dpNameUpdate = {}
                dpNameUpdate[dpId] = name;
                adapter.extendObject(devId, {
                    native: {
                        dpName: dpNameUpdate,
                        dataPointInfo: {
                            dpName: dpNameUpdate,
                        }
                    }
                });
                adapter.extendObject(`${devId}.${dpId}`, {
                    common: {
                        name: name,
                    }
                });
            }
        }
        else if (message.bizCode === 'delete') {
            // "message": {"bizCode":"delete","bizData":{"devId":"05200020b4e62d16d0a0","uid":"eu1547822492582QDKn8","ownerId":"3246959"},"devId":"05200020b4e62d16d0a0","productKey":"qxJSyTLEtX5WrzA9","ts":1667755216839,"uuid":"05200020b4e62d16d0a0"}
            if (knownDevices[message.devId]) {
                adapter.log.info(`Cloud-MQTT notify: Device ${message.devId} was deleted. We will stop to reconnect if not connected. Please clean up the objects manually.`);
                knownDevices[message.devId].stop = true;
            }

        } else if (message.bizCode === 'online') {
            // "message": {"bizCode":"online","bizData":{"time":1667755598},"devId":"bfd3e506bae69c48f5ff9z","productKey":"zqtiam4u","ts":0}
            if (knownDevices[message.devId] && !knownDevices[message.devId].connected && !knownDevices[message.devId].noLocalConnection) {
                handleReconnect(message.devId);
            }
        } else if (message.bizCode === 'offline') {
            //"message": {"bizCode":"offline","bizData":{"time":1667762209},"devId":"05200020b4e62d16d0a0","productKey":"qxJSyTLEtX5WrzA9","ts":0}
            // Nothing to do
        } else if (message.bizCode === 'upgradeStatus') {
            // "message": {"bizCode":"upgradeStatus","bizData":{"devId":"bf8a61ec7888662271pk9q","upgradeStatus":"2","moduleType":"0","description":""},"devId":"bf8a61ec7888662271pk9q","productKey":"fbvia0apnlnattcy","ts":1668363150268,"uuid":"1890996e42c622e8"}
            // Nothing to do
        } else if (message.bizCode === 'upgradeProcess') {
            // "message": {"bizCode":"upgradeProcess","bizData":{"devId":"bf02c988bf11156bb2whi9","firmwareType":0,"progress":0},"devId":"bf02c988bf11156bb2whi9","productKey":"40bjtgxrokhcgzzf","ts":1668613053432,"uuid":"4670ca7b24ab7aba"}
            // Nothing to do
        } else if (message.bizCode === 'bindUser') {
            // "message": {"bizCode":"bindUser","bizData":{"devId":"05200020b4e62d16d0a0","uid":"eu1547822492582QDKn8","ownerId":"3246959","uuid":"05200020b4e62d16d0a0","token":"IsQlk3pa"},"devId":"05200020b4e62d16d0a0","productKey":"qxJSyTLEtX5WrzA9","ts":1667756090224,"uuid":"05200020b4e62d16d0a0"}
            if (!knownDevices[message.devId]) {
                try {
                    await receiveCloudDevices(appCloudApi, true);
                } catch (err) {
                    adapter.log.error(`Error to receive new cloud devices: ${err.message}`);
                }
            }
        } else if (message.bizCode === 'event_notify') {
            // "message": {"bizCode":"event_notify","bizData":{"devId":"XXXX","edata":"XXXX","etype":"doorbell"},"devId":"XXX","productKey":"lasivvb8ccnsma4t","ts":1667915051840,"uuid":"XXXX"}
            // Ignore for now
        }
        else if (message.bizCode === 'p2pSignal') {
            // "message": {"bizCode":"p2pSignal","bizData":..."}
            // Ignore for now
        }
        else {
            adapter.log.debug(`Ignore MQTT message for now: ${JSON.stringify(message)}`);
            Sentry && Sentry.withScope(scope => {
                scope.setLevel('info');
                scope.setExtra("MQTTBizCode", `"message": ${JSON.stringify(message)}`);
                Sentry.captureMessage(`MQTT BizCode ${message.bizCode}`, 'info');
            });
        }
    } else {
        const deviceId = message.devId;
        if (knownDevices[deviceId] && !knownDevices[deviceId].connected && knownDevices[deviceId].dpIdList && knownDevices[deviceId].dpIdList.length) {
            for (const dpData of message.status) {
                let ts = dpData.t ? dpData.t * 1000 : message.t ? message.t * 1000 : undefined;
                delete dpData.t;
                delete dpData.code;
                delete dpData.value;
                let dp = Object.keys(dpData);
                let dpId;
                let value;
                if (!dp.length) {
                    continue;
                }
                if (dp.length > 1) {
                    dp = dp.filter(d => isFinite(d))
                }
                if (dp.length === 1) {
                    dpId = dp[0];
                    value = dpData[dpId];
                } else {
                    continue;
                }
                if (dpId && value !== undefined) {
                    if (!knownDevices[deviceId].dpIdList.includes(parseInt(dpId, 10))) {
                        adapter.log.info(`${deviceId}: Unknown datapoint ${dpId} with value ${value}. Please resync devices`);
                        continue;
                    }
                    if (valueHandler[`${deviceId}.${dpId}`]) {
                        value = valueHandler[`${deviceId}.${dpId}`](value);
                    }
                    if (typeof ts !== 'number') ts = undefined;
                    adapter.setState(`${deviceId}.${dpId}`, {val: value, ts, ack: true});
                    if (enhancedValueHandler[`${deviceId}.${dpId}`]) {
                        for (const subId of Object.keys(enhancedValueHandler[`${deviceId}.${dpId}`])) {
                            const enhancedValue = enhancedValueHandler[`${deviceId}.${dpId}`][subId].handler(value);
                            adapter.setState(enhancedValueHandler[`${deviceId}.${dpId}`][subId].id, {
                                val: enhancedValue,
                                ts,
                                ack: true
                            });
                        }
                    }
                }
            }
        }
    }
}

async function main() {
    setConnected(false);

    // Work around/Hack until https://github.com/joeferner/node-http-mitm-proxy/issues/263 is fixed
    try {
        const mitmCaFile = require.resolve('http-mitm-proxy/lib/ca.js');
        if (mitmCaFile) {
            let fileContent = fs.readFileSync(mitmCaFile, 'utf-8');
            if (fileContent && fileContent.includes('.validity.notBefore.getFullYear() + 2);')) {
                // hacky workaround ... replace twice because should be included two times
                fileContent = fileContent.replace('.validity.notBefore.getFullYear() + 2);', '.validity.notBefore.getFullYear() + 1);');
                fileContent = fileContent.replace('.validity.notBefore.getFullYear() + 2);', '.validity.notBefore.getFullYear() + 1);');
                fs.writeFileSync(mitmCaFile, fileContent, 'utf-8');
                adapter.log.info('http-mitm-proxy/lib/ca.js patched to only generate 1 year long certificates');
            } else {
                adapter.log.debug('http-mitm-proxy/lib/ca.js already patched to only generate 1 year long certificates');
            }
        } else {
            adapter.log.info('http-mitm-proxy/lib/ca.js not found');
        }
    } catch (e) {
        adapter.log.warn(`Cannot patch http-mitm-proxy/lib/ca.js: ${e}`);
    }
    mitm = require('http-mitm-proxy');

    if (adapter.config.cloudUsername && adapter.config.cloudPassword) {
        try {
            const instObj = await adapter.getForeignObjectAsync(`system.adapter.${adapter.namespace}`);
            if (instObj && instObj.common && typeof instObj.common.restartSchedule === 'string' && instObj.common.restartSchedule.endsWith('* * * * *')) {
                delete instObj.common.restartSchedule;
                adapter.log.info(`restart schedule by minute found and removed!`);
                await adapter.setForeignObjectAsync(`system.adapter.${adapter.namespace}`, instObj);
                return;
            }
        } catch (err) {
            adapter.log.error(`Could not check or adjust the restart schedule: ${err.message}`);
        }
    }

    adapter.config.cloudPollingWhenNotConnected = !!adapter.config.cloudPollingWhenNotConnected;
    adapter.config.pollingInterval = parseInt(adapter.config.pollingInterval, 10) || 60;
    if (isNaN(adapter.config.pollingInterval) || adapter.config.pollingInterval < 10) {
        adapter.log.info(`Polling interval ${adapter.config.pollingInterval} too short, setting to 60s`);
        adapter.config.pollingInterval = 60;
    } else if (adapter.config.pollingInterval > 2147482) {
        adapter.config.pollingInterval = 3600;
    }
    adapter.config.cloudPollingInterval = parseInt(adapter.config.cloudPollingInterval, 10) || 120;
    if (isNaN(adapter.config.cloudPollingInterval) || adapter.config.cloudPollingInterval < 60) {
        adapter.config.cloudPollingWhenNotConnected && adapter.log.info('Cloud polling interval is too low. Set to 120 seconds');
        adapter.config.cloudPollingInterval = 120;
    } else if (adapter.config.cloudPollingInterval > 2147482) {
        adapter.config.cloudPollingInterval = 3600;
    }

    objectHelper.init(adapter);

    adapter.getDevices(async (err, devices) => {
        let deviceCnt = 0;
        if (devices && devices.length) {
            const devicesToInit = [];
            for (const device of devices) {
                if (device._id.includes('.groups.')) {
                    continue;
                }
                devicesToInit.push(device);
            }
            deviceCnt = devicesToInit.length;
            adapter.log.debug(`init ${deviceCnt} known devices`);
            for (const device of devicesToInit) {
                if (device._id && device.native) {
                    const id = device._id.substr(adapter.namespace.length + 1);
                    await initDevice(id, device.native.productKey, device.native, ['name'], false, async () => {
                        if (!--deviceCnt) await initDone();
                    });
                } else {
                    if (!--deviceCnt) await initDone();
                }
            }
        } else if (!deviceCnt) {
            await initDone();
        }
    });
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
