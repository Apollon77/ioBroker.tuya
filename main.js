/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const adapter = new utils.Adapter('tuya');
const objectHelper = require(__dirname + '/lib/objectHelper'); // Get common adapter utils
const mapper = require(__dirname + '/lib/mapper'); // Get common adapter utils
const dgram = require('dgram');
const Parser = require('tuyapi/lib/message-parser.js');
const extend = require('extend');
const os = require('os');

const AnyProxy = require('anyproxy');
let server;
let proxyServer;
let proxyStopTimeout;
let proxyAdminMessageCallback;

const TuyaDevice = require('tuyapi');

const knownDevices = {};
const valueHandler = {};
let connected = null;
let connectedCount = 0;

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function(callback) {
    try {
        setConnected(false);
        stopAll();
        // adapter.log.info('cleaned everything up...');
        setTimeout(callback, 3000);
    } catch (e) {
        callback();
    }
});

process.on('SIGINT', function() {
    stopAll();
    setConnected(false);
});

process.on('uncaughtException', function(err) {
    console.log('Exception: ' + err + '/' + err.toString());
    if (adapter && adapter.log) {
        adapter.log.warn('Exception: ' + err);
    }
    stopAll();
    setConnected(false);
});


// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
    objectHelper.handleStateChange(id, state);

});

adapter.on('message', function(msg) {
    processMessage(msg);
});

function setConnected(isConnected) {
    if (connected !== isConnected) {
        connected = isConnected;
        adapter.setState('info.connection', connected, true, (err) => {
            // analyse if the state could be set (because of permissions)
            if (err) adapter.log.error('Can not update connected state: ' + err);
            else adapter.log.debug('connected set to ' + connected);
        });
    }
}

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
    main();
});

function stopAll() {
    for (const deviceId in knownDevices) {
        if (!knownDevices.hasOwnProperty(deviceId)) continue;
        knownDevices[deviceId].stop = true;
        if (knownDevices[deviceId].device) {
            knownDevices[deviceId].device.disconnect();
            knownDevices[deviceId].device = null;
        }
    }
}

function initDeviceObjects(deviceId, data, objs, values, preserveFields) {
    if (!values) {
        values = {};
    }
    if (!preserveFields) {
        preserveFields = [];
    }
    objs.forEach((obj) => {
        const id = obj.id;
        delete obj.id;
        let onChange;
        if (!data.localKey) {
            obj.write = false;
        }
        if (obj.write) {
            onChange = (value) => {
                if (!knownDevices[deviceId].device) {
                    adapter.log.debug(deviceId + 'Device communication not initialized ...');
                    return;
                }

                if (obj.scale) {
                    value *= Math.pow(10, obj.scale);
                }
                else if (obj.states) {
                    value = obj.states[value.toString()];
                }

                knownDevices[deviceId].device.set({
                    'dps': id,
                    'set': value
                }).then(() => {
                    adapter.log.debug(deviceId + '.' + id + ': set value ' + value);
                    pollDevice(deviceId, 2000);
                }).catch((err) => {
                    adapter.log.error(deviceId + '.' + id + ': ' + err);
                    pollDevice(deviceId, 2000);
                });
            };
        }
        if (obj.scale) {
            valueHandler[deviceId + '.' + id] = (value) => {
                if (value === undefined) return undefined;
                return Math.floor(value * Math.pow(10, -obj.scale) * 100) / 100;
            };
            values[id] = valueHandler[deviceId + '.' + id](values[id]);
        }
        else if (obj.states) {
            valueHandler[deviceId + '.' + id] = (value) => {
                if (value === undefined) return undefined;
                for (const key in obj.states) {
                    if (!obj.states.hasOwnProperty(key)) continue;
                    if (obj.states[key] === value) return key;
                }
                adapter.log.warn(deviceId + '.' + id + ': Value from device not defined in Schema: ' + value);
                return null;
            };
            values[id] = valueHandler[deviceId + '.' + id](values[id]);
        }
        objectHelper.setOrUpdateObject(deviceId + '.' + id, {
            type: 'state',
            common: obj
        }, preserveFields, values[id], onChange);
    });
}

function pollDevice(deviceId, overwriteDelay) {
    if (!overwriteDelay) {
        overwriteDelay = adapter.config.pollingInterval * 1000;
    }
    if (knownDevices[deviceId].pollingTimeout) {
        clearTimeout(knownDevices[deviceId].pollingTimeout);
        knownDevices[deviceId].pollingTimeout = null;
    }
    knownDevices[deviceId].pollingTimeout = setTimeout(() => {
        knownDevices[deviceId].pollingTimeout = null;
        knownDevices[deviceId].device.get({
            returnAsEvent: true
        });
        pollDevice(deviceId);
    }, overwriteDelay);
}


function initDevice(deviceId, productKey, data, preserveFields, callback) {
    if (!preserveFields) {
        preserveFields = [];
    }
    data.productKey = productKey;
    let values;
    if (data.dps) {
        values = data.dps;
        delete data.dps;
    }
    // {"ip":"192.168.178.85","gwId":"34305060807d3a1d7178","active":2,"ability":0,"mode":0,"encrypt":true,"productKey":"8FAPq5h6gdV51Vcr","version":"3.1"}
    let schema, schemaExt;
    if (!data.schema) {
        const known = mapper.getSchema(productKey);
        adapter.log.debug(deviceId + ': Schema found for ' + productKey + ': ' + known);
        if (known) {
            data.schema = known.schema;
            data.schemaExt = known.schemaExt;
        }
    }

    knownDevices[deviceId] = extend(true, {}, knownDevices[deviceId] || {}, {
        'data': data
    });
    knownDevices[deviceId].errorcount = 0;

    if (knownDevices[deviceId].device) {
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
    }
    if (!data.localKey) {
        data.localKey = knownDevices[deviceId].localKey || '';
    }
    else {
        knownDevices[deviceId].localKey = data.localKey;
    }
    if (data.ip) {
        knownDevices[deviceId].ip = data.ip;
    }

    adapter.log.debug(deviceId + ': Create device objects if not exist');
    objectHelper.setOrUpdateObject(deviceId, {
        type: 'device',
        common: {
            name: data.name || 'Device ' + deviceId
        },
        native: data
    });
    objectHelper.setOrUpdateObject(deviceId + '.online', {
        type: 'state',
        common: {
            name: 'Device online status',
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false
        }
    }, false);
    objectHelper.setOrUpdateObject(deviceId + '.ip', {
        type: 'state',
        common: {
            name: 'Device IP',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false
        }
    }, data.ip);

    if (data.schema) {
        const objs = mapper.getObjectsForSchema(data.schema, data.schemaExt);
        initDeviceObjects(deviceId, data, objs, values, preserveFields);
        knownDevices[deviceId].objectsInitialized = true;
    }

    objectHelper.processObjectQueue(() => {
        if (!knownDevices[deviceId].ip) {
            adapter.log.info(deviceId + ': Can not start because IP unknown');
            callback && callback();
            return;
        }

        adapter.log.info(deviceId + ' Init with IP=' + knownDevices[deviceId].ip + ', Key=' + knownDevices[deviceId].localKey);
        knownDevices[deviceId].stop = false;
        knownDevices[deviceId].device = new TuyaDevice({
            id: deviceId,
            key: knownDevices[deviceId].localKey || '0000000000000000',
            ip: knownDevices[deviceId].ip,
            persistentConnection: true
        });

        knownDevices[deviceId].device.on('data', (data) => {
            knownDevices[deviceId].errorcount = 0;
            if (typeof data !== 'object' || !data || !data.dps) return;
            if (data.devId !== deviceId) {
                adapter.log.warn(deviceId + ': Received data for other deviceId ' + data.devId + ' ... ignoring');
                return;
            }
            adapter.log.debug(deviceId + ': Received data: ' + JSON.stringify(data.dps));

            if (!knownDevices[deviceId].objectsInitialized) {
                adapter.log.info(deviceId + ': No schema exists, init basic states ...');
                initDeviceObjects(deviceId, data, mapper.getObjectsForData(data.dps, !!knownDevices[deviceId].localKey), data.dps, ['name']);
                knownDevices[deviceId].objectsInitialized = true;
                objectHelper.processObjectQueue();
                return;
            }
            for (const id in data.dps) {
                if (!data.dps.hasOwnProperty(id)) continue;
                let value = data.dps[id];
                if (valueHandler[deviceId + '.' + id]) {
                    value = valueHandler[deviceId + '.' + id](value);
                }
                adapter.setState(deviceId + '.' + id, value, true);
            }

        });

        knownDevices[deviceId].device.on('connected', () => {
            adapter.log.debug(deviceId + ': Connected to device');
            adapter.setState(deviceId + '.online', true, true);
            if (knownDevices[deviceId].reconnectTimeout) {
                clearTimeout(knownDevices[deviceId].reconnectTimeout);
                knownDevices[deviceId].reconnectTimeout = null;
            }
            connectedCount++;
            if (!connected) setConnected(true);
        });

        knownDevices[deviceId].device.on('disconnected', () => {
            adapter.log.debug(deviceId + ': Disconnected from device');
            adapter.setState(deviceId + '.online', false, true);
            if (!knownDevices[deviceId].stop) {
                if (knownDevices[deviceId].reconnectTimeout) {
                    clearTimeout(knownDevices[deviceId].reconnectTimeout);
                    knownDevices[deviceId].reconnectTimeout = null;
                }
                knownDevices[deviceId].reconnectTimeout = setTimeout(() => {
                    knownDevices[deviceId].device.connect();
                }, 60000);
            }
            connectedCount--;
            if (connected && connectedCount === 0) setConnected(false);
        });

        knownDevices[deviceId].device.on('error', (err) => {
            adapter.log.debug(deviceId + ': Error from device (' + knownDevices[deviceId].errorcount + '): App still open on your mobile phone? ' + err);
            knownDevices[deviceId].errorcount++;

            if (knownDevices[deviceId].errorcount > 3) {
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
            }
        });

        knownDevices[deviceId].device.connect();

        if (!knownDevices[deviceId].localKey) {
            adapter.log.info(deviceId + ': No local encryption key available, get data using polling, controlling of device NOT possibe. Please sync with App!');
            pollDevice(deviceId);
        }

        callback && callback();
    });
}


function discoverLocalDevices() {
    server = dgram.createSocket('udp4');

    server.on('listening', function() {
        const address = server.address();
        adapter.log.info('Discover for local Tuya devices on port 6666');
    });

    server.on('message', function(message, remote) {
        adapter.log.debug('Discovered device: ' + remote.address + ':' + remote.port + ' - ' + message);
        let data;
        try {
            data = Parser.parse(message);
        }
        catch (err) {
            return;
        }
        if (!data.data || !data.data.gwId) return;
        if (knownDevices[data.data.gwId] && knownDevices[data.data.gwId].device) return;
        initDevice(data.data.gwId, data.data.productKey, data.data, ['name']);
    });

    server.bind(6666);
}

function initDone() {
    adapter.log.info('Existing devices initialized');
    discoverLocalDevices();
    adapter.subscribeStates('*');
}

function processMessage(msg) {
    adapter.log.debug('Message: ' + JSON.stringify(msg));
    switch (msg.command) {
        case 'startProxy':
            startProxy(msg);
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

function startProxy(msg) {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
        AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
            // let users to trust this CA before using proxy
            if (!error) {
                const certDir = require('path').dirname(keyPath);
                adapter.log.info('The proxy certificate is generated at' + certDir);
                return startProxy(msg);
            } else {
                adapter.log.error('error when generating rootCA', error);
                adapter.sendTo(msg.from, msg.command, {
                    result:     false,
                    error:      error
                }, msg.callback);
                return;
            }
        });
    }

    const ifaces = os.networkInterfaces();
    let ownIp;
    for (const eth in ifaces) {
        if (!ifaces.hasOwnProperty(eth)) continue;
        for (let num = 0; num < ifaces[eth].length; num++) {
            if (ifaces[eth][num].family !== 'IPv6' && ifaces[eth][num].address !== '127.0.0.1' && ifaces[eth][num].address !== '0.0.0.0') {
                ownIp = ifaces[eth][num].address;
                adapter.log.debug('Use first network interface (' + ownIp + ')');
                break;
            }
        }
        if (ownIp) break;
    }

    const options = {
        port: msg.message.proxyPort,
        rule: require('./lib/anyproxy-rule.js')(adapter, catchProxyInfo),
        webInterface: {
            enable: true,
            webPort: msg.message.proxyWebPort
        },
        throttle: 10000,
        forceProxyHttps: true,
        wsIntercept: false,
        silent: false // TODO
    };

    if (!proxyServer) {
        proxyServer = new AnyProxy.ProxyServer(options);

        proxyServer.on('ready', () => {
            adapter.log.info('Anyproxy ready to receive requests');
            const QRCode = require('qrcode');
            let qrCodeCert;
            QRCode.toDataURL('http://' + ownIp + ':' + msg.message.proxyWebPort + '/fetchCrtFile').then((url) => {
                qrCodeCert = url;
                adapter.sendTo(msg.from, msg.command, {
                    result: {
                        qrcodeCert: qrCodeCert
                    },
                    error: null
                }, msg.callback);
                proxyStopTimeout = setTimeout(() => {
                    if (proxyServer) {
                        proxyServer.close();
                        proxyServer = null;
                    }
                }, 600000);
            }).catch(err => {
                console.error(err);
            });
        });

        proxyServer.on('error', (err) => {
            adapter.log.error('Anyproxy ERROR: ' + err);
            adapter.log.error(err.stack);
        });

        proxyServer.start();
    }
    else {
        clearTimeout(proxyStopTimeout);
        proxyStopTimeout = setTimeout(() => {
            if (proxyServer) {
                proxyServer.close();
                proxyServer = null;
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
        proxyServer.close();
        proxyServer = null;
    }
    adapter.sendTo(msg.from, msg.command, {
        result:     true,
        error:      null
    }, msg.callback);
}

function catchProxyInfo(data) {
    if (!data || !data.result || !Array.isArray(data.result)) return;

    let devices = [];
    let deviceInfos = [];

    data.result.forEach((obj) => {
        if (obj.a === 'tuya.m.my.group.device.list') {
            devices = obj.result;
        }
        else if (obj.a === 'tuya.m.device.ref.info.my.list') {
            deviceInfos = obj.result;
        }
    });

    if (deviceInfos && deviceInfos.length) {
        adapter.log.debug('Found ' + deviceInfos.length + ' device schema information');
        deviceInfos.forEach((deviceInfo) => {
            if (mapper.addSchema(deviceInfo.id, deviceInfo.schemaInfo)) {
                adapter.log.info('new Shema added for product type ' + deviceInfo.id + '. Please send next line from logfile on disk to developer!');
                adapter.log.info(JSON.stringify(deviceInfo.schemaInfo));
            }
        });
    }
    else {
        deviceInfos = [];
    }

    if (devices && devices.length) {
        adapter.log.debug('Found ' + devices.length + ' devices');
        devices.forEach((device) => {
            delete device.ip;
            device.schema = false;
            initDevice(device.devId, device.productId, device);
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
        });
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


// main function
function main() {
    setConnected(false);
    objectHelper.init(adapter);

    adapter.config.pollingInterval = parseInt(adapter.config.pollingInterval, 10) || 60;

    adapter.getDevices((err, devices) => {
        let deviceCnt = 0;
        if (devices && devices.length) {
            adapter.log.debug('init ' + devices.length + ' known devices');
            devices.forEach((device) => {
                if (device._id && device.native) {
                    const id = device._id.substr(adapter.namespace.length + 1);
                    deviceCnt++;
                    initDevice(id, device.native.productKey, device.native, ['name'], () => {
                        if (!--deviceCnt) initDone();
                    });
                }
            });
        }
        if (!deviceCnt) {
            initDone();
        }
    });
}
