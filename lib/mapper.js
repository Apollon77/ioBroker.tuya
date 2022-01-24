/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';
const fs = require('fs');
const path = require('path');

let knownSchemas = {};
try {
    knownSchemas = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf-8'));
} catch(err) {
    console.log(`Error while loading Schema information: ${err}`);
}

function addSchema(productKey, schema) {
    if (!productKey || !schema) return false;
    if (knownSchemas[productKey]) {
        return false;
    }
    knownSchemas[productKey] = schema;
    return true;
}

function getSchema(productKey) {
    if (!knownSchemas[productKey]) return null;

    let res;
    try {
        res = {
            schema: JSON.parse(knownSchemas[productKey].schema),
            schemaExt: JSON.parse(knownSchemas[productKey].schemaExt)
        };
    }
    catch (err) {
        console.log(' Parse Error in Schema for ' + productKey + ': ' + err);
        res = null;
    }

    return res;
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
        if (!def.property) {
            switch (def.type) {
                case 'raw':
                    common.type = 'string';
                    common.encoding = 'base64';
                    break;
                default:
                    return;
            }
        }
        else {
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
                case 'bitmap':
                    common.type = 'number';
                    break;
                case 'enum':
                    common.type = 'number';
                    if (def.property.range && Array.isArray(def.property.range)) {
                        common.states = {};
                        def.property.range.forEach((val, index) => {
                            common.states[index] = val;
                        });
                        if (def.desc && def.desc !== '') {
                            const descDetails = def.desc.split("\\n");
                            if (descDetails && descDetails.length) {
                                descDetails.forEach((val) => {
                                    const desc = val.match(/([0-9]+):(.*)/);
                                    if (desc && desc[0] && desc[1]) {
                                        const index = def.property.range.indexOf(desc[0].toString());
                                        if (index !== -1) common.states[desc[0].toString()] += ' (' + desc[1] + ')';
                                    }
                                });
                                def.desc = '';
                            }
                        }
                    }
                    break;
                default:
                    common.type = 'string';
            }

            common.unit = def.property.unit || def.desc || undefined;
            common.min = def.property.min || undefined;
            common.max = def.property.max || undefined;
            common.scale = def.property.scale || undefined;
            if ((def.code === 'cur_power' || def.code === 'cur_voltage') && !common.scale) common.scale = 1;
        }

        common.read  = def.mode.includes('r');
        common.write = def.mode.includes('w');
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
