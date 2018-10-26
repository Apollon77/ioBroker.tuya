/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const knownSchemas = {
    "8FAPq5h6gdV51Vcr": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "XjGNEvQmy6OXtEGF": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_3\",\"name\":\"开关3\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB 1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":101,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown2\",\"name\":\"开关2倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":102,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown3\",\"name\":\"开关3倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_usb1\",\"name\":\"USB倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":105,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\"plain\"},{\"id\":3,\"inputType\":\"plain\"},{\"id\":7,\"inputType\":\"plain\"},{\"id\":101,\"inputType\":\" \"},{\"id\":102,\"inputType\":\" \"},{\"id\":103,\"inputType\":\" \"},{\"id\":105,\"inputType\":\" \"}]"
    },
    "1hxNMF9lRQL2xpEA": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "fT3Ltv613pRi4WXr":{
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"Bright\",\"property\":{\"unit\":\"\",\"min\":11,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"percent\"},{\"id\":3,\"inputType\":\"\"}]"
    },
    "HGZ7aIKOHk99IAoA": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"工作模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"},{\"id\":3,\"inputType\":\"percent\"},{\"id\":4,\"inputType\":\" \"}]"
    }
};

function addSchema(productKey, schema) {
    if (!productKey || !schema) return false;
    let res = true;
    if (knownSchemas[productKey]) {
        res = (knownSchemas[productKey].schema !== schema.schema && knownSchemas[productKey].schemaExt !== schema.schemaExt);
    }
    knownSchemas[productKey] = schema;
}

function getSchema(productKey) {
    if (!knownSchemas[productKey]) return null;
    return {
        schema: JSON.parse(knownSchemas[productKey].schema),
        schemaExt: JSON.parse(knownSchemas[productKey].schemaExt)
    };
}

function defineRole(obj) {
    // Try to set roles
    let role = '';
    if (obj.type === 'boolean') {
        if (obj.read && !obj.write) { // Boolean, read-only --> Sensor OR Indicator!
            role = 'sensor';
        }
        else if (obj.write && !obj.read) { // Boolean, write-only --> Button
            role = 'button';
        }
        else if (obj.read && obj.write) { // Boolean, read-write --> Switch
            role = 'switch';
        }
    }
    else if (obj.type === 'number') {
        if (obj.read && !obj.write) { // Number, read-only --> Value
            role = 'value';
        }
        else if (obj.write && !obj.read) { // Boolean, write-only --> ?? Level?
            role = 'level';
        }
        else if (obj.read && obj.write) { // Number, read-write --> Level
            role = 'level';
        }
    }
    else if (obj.type === 'string') {
        role = 'text';
    }
    return role;
}

function getObjectsForSchema(schema, schemaExt) {
    let objs = [];
    if (!schema || ! Array.isArray(schema)) return objs;
    schema.forEach((def) => {
        const common = {};
        switch (def.property.type) {
            case 'value':
                common.type = 'number';
                break;
            case 'bool':
                common.type = 'boolean';
                break;
            case 'string':
                common.type = 'string';
                break;
            default:
                common.type = 'string';
        }

        common.unit = def.property.unit || def.desc || undefined;
        common.min = def.property.min || undefined;
        common.max = def.property.max || undefined;
        common.scale = def.property.scale || undefined;

        common.read  = (def.property.mode === 'ro' || def.property.mode === 'rw');
        common.write = (def.property.mode === 'rw');
        if (!common.read && !common.write) {
            common.read = true;
        }

        common.name = def.code;
        common.id = def.id;

        const role = defineRole(common);
        if (role !== '') common.role = role;
        if (!common.role) common.role = 'state';

        if (schemaExt) {
            schemaExt.forEach((ext) => {
                if (ext.id === common.id) {
                    switch (ext.inputType) {
                        case 'percent':
                            common.unit = '%';
                            break;
                    }
                }
            });
        }

        objs.push(common);
    });
    return objs;
}

function getObjectsForData(data, allowWrite) {
    let objs = [];
    if (!data) return objs;

    for (const id in data) {
        if (!data.hasOwnProperty(id)) continue;
        const common = {};
        switch(typeof data[id]) {
            case 'boolean':
            case 'string':
            case 'number':
                common.type = typeof data[id];
                break;
            default:
                common.type = 'string';
        }
        common.read = true;
        common.write = !!allowWrite;

        common.name = id;
        common.id = id;

        const role = defineRole(common);
        if (role !== '') common.role = role;
        if (!common.role) common.role = 'state';

        objs.push(common);
    }
    return objs;
}


module.exports = {
    getSchema: getSchema,
    addSchema: addSchema,
    getObjectsForSchema: getObjectsForSchema,
    getObjectsForData: getObjectsForData
};
