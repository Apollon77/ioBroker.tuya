/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

// Details from other projects
// https://github.com/prokudin07/zigbee-herdsman-converters/blob/master/lib/tuya.js
// https://github.com/prokudin07/zigbee-herdsman-converters/blob/master/devices/tuya.js

const colorTools = require('./color_tools.js');

function padding(num, maxLength) {
    if (!maxLength) maxLength = 2;
    num = num.toString(16);
    while (num.length < maxLength) num = `0${num}`;
    return num;
}

function getPhaseStates(labelPrefix) {
    return [
        {
            namePostfix: '-voltage',
            common: {
                name: `${labelPrefix} Voltage`,
                type: 'number',
                role: 'value.voltage',
                unit: 'V',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 14) {
                    // experimental according to https://github.com/prokudin07/zigbee-herdsman-converters/blob/96c6e36eb16fa56d1fe840d549a57a74da9b690e/lib/tuya.js#L1260
                    return value.readUInt16BE(13) / 10;
                } else if (value.length > 1 && value.length <= 10) {
                    return value.readUInt16BE(0) / 10;
                }
                return null;
            },
        },
        {
            namePostfix: '-current',
            common: {
                name: `${labelPrefix} Current`,
                type: 'number',
                role: 'value.current',
                unit: 'A',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 14) {
                    // experimental according to https://github.com/prokudin07/zigbee-herdsman-converters/blob/96c6e36eb16fa56d1fe840d549a57a74da9b690e/lib/tuya.js#L1260
                    return value.readUInt16BE(11) / 1000;
                } else if (value.length > 4 && value.length <= 10) {
                    return value.readUInt16BE(3) / 1000;
                }
                return null;
            },
        },
        {
            namePostfix: '-power',
            common: {
                name: `${labelPrefix} Power`,
                type: 'number',
                role: 'value.power',
                unit: 'W',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 7 && value.length <= 10) {
                    return value.readUInt16BE(6);
                }
                return null;
            },
        },
        {
            namePostfix: '-frequency',
            common: {
                name: `${labelPrefix} Frequency`,
                type: 'number',
                role: 'value.frequency',
                unit: 'Hz',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 9 && value.length <= 10) {
                    return value.readUInt16BE(8) / 10;
                }
                return null;
            },
        }
    ];
}

function getDcDataStates(labelPrefix) {
    return [
        {
            namePostfix: '-voltage',
            common: {
                name: `${labelPrefix} Voltage`,
                type: 'number',
                role: 'value.voltage',
                unit: 'V',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 1 && value.length <= 10) {
                    return value.readUInt16BE(0) / 10;
                }
                return null;
            },
        },
        {
            namePostfix: '-current',
            common: {
                name: `${labelPrefix} Current`,
                type: 'number',
                role: 'value.current',
                unit: 'A',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 3 && value.length <= 10) {
                    return value.readUInt16BE(3) / 10;
                }
                return null;
            },
        },
        {
            namePostfix: '-power',
            common: {
                name: `${labelPrefix} Power`,
                type: 'number',
                role: 'value.power',
                unit: 'W',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'string') return null;
                const value = Buffer.from(dpValue, 'base64');
                if (value.length > 5 && value.length <= 10) {
                    return value.readUInt16BE(4) * 10;
                }
                return null;
            },
        },
    ];
}


const enhancedLogicMap = [
    {
        dpId: 5,
        dpCode: ['colour', 'colour_data'],
        states: [
            {
                namePostfix: '-rgb',
                common: {
                    name: 'RGB',
                    type: 'string',
                    role: 'level.color.rgb'
                },
                onDpSet: (dpValue, isGroupValue) => { // convert from rrggbb0hhhssvv to #rrggbb
                    if (typeof dpValue !== 'string') return '';
                    if (isGroupValue) { // 240;248;255
                        const rgb = dpValue.split(';');
                        if (rgb.length === 3) {
                            return `#${padding(parseInt(rgb[0], 10), 2)}${padding(parseInt(rgb[1], 10), 2)}${padding(parseInt(rgb[2], 10), 2)}`;
                        }
                    }
                    if (dpValue.length !== 14) return '';
                    const rgb = dpValue.substring(0, 6);
                    return `#${rgb}`;
                },
                onValueChange: (value, isGroupValue) => { // convert from #rrggbb to rrggbb0hhhssvv
                    if (typeof value !== 'string' || value.length !== 7 || value[0] !== '#') return {};
                    const r = parseInt(value.substring(1, 3), 16);
                    const g = parseInt(value.substring(3, 5), 16);
                    const b = parseInt(value.substring(5, 7), 16);
                    const [h, s, v] = colorTools.rgbToHsv(r, g, b);
                    let res = `${padding(r, 2)}${padding(g, 2)}${padding(b, 2)}`;
                    res += `${padding(Math.round(h * 360), 4)}`;
                    res += `${padding(Math.round(s * 255), 2)}`;
                    res += `${padding(Math.round(v * 255), 2)}`;
                    return {
                        '5': res
                    }
                }
            }
        ],
    },
    {
        dpId: 24,
        dpCode: ['colour_data', 'colour'],
        states: [
            {
                namePostfix: '-rgb',
                common: {
                    name: 'RGB',
                    type: 'string',
                    role: 'level.color.rgb'
                },
                onDpSet: (dpValue, isGroupValue) => { // convert from hhhhssssvvvv to #rrggbb
                    if (typeof dpValue !== 'string') return '';
                    if (isGroupValue) { // 240;248;255
                        const rgb = dpValue.split(';');
                        if (rgb.length === 3) {
                            return `#${padding(parseInt(rgb[0], 10), 2)}${padding(parseInt(rgb[1], 10), 2)}${padding(parseInt(rgb[2], 10), 2)}`;
                        }
                    }
                    if (dpValue.length !== 12) return '';
                    const h = parseInt(dpValue.substring(0, 4), 16) / 360;
                    const s = parseInt(dpValue.substring(4, 8), 16) / 1000;
                    const v = parseInt(dpValue.substring(8, 12), 16) / 1000;
                    const [r, g, b] = colorTools.hsvToRgb(h, s, v);
                    return `#${padding(r, 2)}${padding(g, 2)}${padding(b, 2)}`;
                },
                onValueChange: (value, isGroupValue) => { // convert from #rrggbb to hhhhssssvvvv
                    if (typeof value !== 'string' || value.length !== 7 || value[0] !== '#') return {};
                    const r = parseInt(value.substring(1, 3), 16);
                    const g = parseInt(value.substring(3, 5), 16);
                    const b = parseInt(value.substring(5, 7), 16);
                    const [h, s, v] = colorTools.rgbToHsv(r, g, b);
                    let res = `${padding(Math.round(h * 360), 4)}`;
                    res += `${padding(Math.round(s * 1000), 4)}`;
                    res += `${padding(Math.round(v * 1000), 4)}`;
                    return {
                        '24': res
                    }
                }
            }
        ],
    },
    {
        dpCode: ['phase_a'],
        states: getPhaseStates('Phase A'),
    },
    {
        dpCode: ['phase_b'],
        states: getPhaseStates('Phase B'),
    },
    {
        dpCode: ['phase_c'],
        states: getPhaseStates('Phase C'),
    },
    {
        dpCode: ['pv1_dc_data'],
        states: getDcDataStates('PV1 DC Data'),
    },
    {
        dpCode: ['pv2_dc_data'],
        states: getDcDataStates('PV2 DC Data'),
    },
    {
        dpId: 17,
        dpCode: ['alarm_set_2'],
        states: [
            {
                namePostfix: '-decoded',
                common: {
                    name: `Alarm Settings`,
                    type: 'string',
                    role: 'json'
                },
                onDpSet: (dpValue, isGroupValue) => {
                    if (typeof dpValue !== 'string') return '';
                    const value = Buffer.from(dpValue, 'base64');
                    const alarmTypes = [
                        'overcurrent',
                        'three_phase_current_imbalance',
                        'ammeter_overvoltage',
                        'under_voltage',
                        'three_phase_current_loss',
                        'power_failure',
                        'magnetic',
                        'insufficient_balance',
                        'arrears',
                        'battery_overvoltage',
                        'cover_open',
                        'meter_cover_open',
                        'fault'
                    ];
                    if (value.length % 4 !== 0) return '';
                    const res = [];
                    for (let i = 0; i < value.length; i += 4) {
                        const alarmCode = value.readUInt8(i);
                        res.push({
                            alarmCode: alarmTypes[alarmCode] || `unknown (${alarmCode})`,
                            doAction: !!value.readUInt8(i + 1),
                            threshold: value.readUInt16BE(i + 2),
                        });
                    }
                    return JSON.stringify(res);
                },
                onValueChange: (value, isGroupValue) => {
                    if (typeof value !== 'string' || value[0] !== '[' || value[value.length - 1] !== ']') return {};
                    let data;
                    try {
                        data = JSON.parse(value);
                    } catch (e) {
                        return {};
                    }
                    if (!Array.isArray(data)) {
                        return {};
                    }
                    const alarmTypes = [
                        'overcurrent',
                        'three_phase_current_imbalance',
                        'ammeter_overvoltage',
                        'under_voltage',
                        'three_phase_current_loss',
                        'power_failure',
                        'magnetic',
                        'insufficient_balance',
                        'arrears',
                        'battery_overvoltage',
                        'cover_open',
                        'meter_cover_open',
                        'fault'
                    ];
                    const buf = Buffer.alloc(data.length * 4);
                    for (let i = 0; i < data.length; i++) {
                        if (typeof data[i].alarmCode !== 'string' || typeof data[i].doAction !== 'boolean' || typeof data[i].threshold !== 'number') {
                            return {};
                        }
                        const alarmCode = alarmTypes.indexOf(data[i].alarmCode);
                        if (alarmCode === -1) return {};
                        buf.writeUInt8(alarmCode, i * 4);
                        buf.writeUInt8(data[i].doAction ? 1 : 0, i * 4 + 1);
                        buf.writeUInt16BE(data[i].threshold, i * 4 + 2);
                    }
                    return {
                        '17': buf.toString('base64')
                    }
                }
            },
        ]
    }
];

function getEnhancedLogic(dpId, dpCode) {
    for (const logic of enhancedLogicMap) {
        if ((logic.dpId === undefined || logic.dpId === dpId) && logic.dpCode.includes(dpCode)) {
            const res = [];
            logic.states.forEach(state => {
                res.push({
                    common: JSON.parse(JSON.stringify(state.common)),
                    onDpSet: state.onDpSet,
                    onValueChange: state.onValueChange,
                    namePostfix: state.namePostfix
                });
            });
            return res;
        }
    }
    return null;
}

function getBitmapLogic(dpId, def) {
    if (!def.property || def.property.type !== 'bitmap' || !def.property.label || !Array.isArray(def.property.label)) {
        return [];
    }
    const res = [];
    for (let i = 0; i < def.property.label.length; i++) {
        res.push({
            common: {
                name: `${def.name} ${def.property.label[i]}`,
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: false
            },
            onDpSet: (dpValue, isGroupValue) => {
                if (typeof dpValue !== 'number') return null;
                return !!(dpValue & (1 << i));
            },
            // onValueChange no write support for now
            namePostfix: `-${i}`
        });
    }
    return res;
}

module.exports = {
    enhancedLogicMap,
    getEnhancedLogic,
    getBitmapLogic
};
