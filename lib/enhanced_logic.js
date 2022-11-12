/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const colorTools = require('./color_tools.js');

function padding(num, maxLength) {
    if (!maxLength) maxLength = 2;
    num = num.toString(16);
    while (num.length < maxLength) num = `0${num}`;
    return num;
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
                onDpSet: (dpValue) => { // convert from rrggbb0hhhssvv to #rrggbb
                    if (typeof dpValue !== 'string' || dpValue.length !== 14) return '';
                    const rgb = dpValue.substring(0, 6);
                    return `#${rgb}`;
                },
                onValueChange: (value) => { // convert from #rrggbb to rrggbb0hhhssvv
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
                onDpSet: (dpValue) => { // convert from hhhhssssvvvv to #rrggbb
                    if (typeof dpValue !== 'string' || dpValue.length !== 12) return '';
                    const h = parseInt(dpValue.substring(0, 4), 16) / 360;
                    const s = parseInt(dpValue.substring(4, 6), 16) / 1000;
                    const v = parseInt(dpValue.substring(6, 8), 16) / 1000;
                    const [r, g, b] = colorTools.hsvToRgb(h, s, v);
                    return `#${padding(r, 2)}${padding(g, 2)}${padding(b, 2)}`;
                },
                onValueChange: (value) => { // convert from #rrggbb to hhhhssssvvvv
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
    }
];

function getEnhancedLogic(dpId, dpCode) {
    for (const logic of enhancedLogicMap) {
        if (logic.dpId === dpId && logic.dpCode.includes(dpCode)) {
            return {
                common: JSON.parse(JSON.stringify(logic.states[0].common)),
                onDpSet: logic.states[0].onDpSet,
                onValueChange: logic.states[0].onValueChange,
                namePostfix: logic.states[0].namePostfix
            };
        }
    }
    return null;
}

module.exports = {
    enhancedLogicMap,
    getEnhancedLogic
};
