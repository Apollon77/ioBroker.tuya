/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const knownSchemas = {
    "8FAPq5h6gdV51Vcr": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "XjGNEvQmy6OXtEGF": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_3\",\"name\":\"开关3\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB 1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":101,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown2\",\"name\":\"开关2倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":102,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown3\",\"name\":\"开关3倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_usb1\",\"name\":\"USB倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":105,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\"plain\"},{\"id\":3,\"inputType\":\"plain\"},{\"id\":7,\"inputType\":\"plain\"},{\"id\":101,\"inputType\":\" \"},{\"id\":102,\"inputType\":\" \"},{\"id\":103,\"inputType\":\" \"},{\"id\":105,\"inputType\":\" \"}]"
    },
    "1hxNMF9lRQL2xpEA": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "fT3Ltv613pRi4WXr":{
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"Bright\",\"property\":{\"unit\":\"\",\"min\":11,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"percent\"},{\"id\":3,\"inputType\":\"\"}]"
    },
    "HGZ7aIKOHk99IAoA": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"工作模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"},{\"id\":3,\"inputType\":\"percent\"},{\"id\":4,\"inputType\":\" \"}]"
    },
    "PaYQNcPunOhPeS1X": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":2500,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":9,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"},{\"id\":6,\"inputType\":\"\"},{\"id\":7,\"inputType\":\"\"},{\"id\":8,\"inputType\":\"\"},{\"id\":9,\"inputType\":\"\"}]"
    },
    "XExf4P4bLRPKA3dw": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大1000倍之后的值，即上报56，实际值为0.056度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"\"},{\"id\":3,\"inputType\":\"\"},{\"id\":4,\"inputType\":\"\"},{\"id\":5,\"inputType\":\"\"},{\"id\":6,\"inputType\":\"\"}]"
    },
    "9p017mRuEwVchApg": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"工作模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":3,\"inputType\":\"percent\"},{\"id\":4,\"inputType\":\"\"}]"
    },
    "ovvg6eKhVt6sb92l": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"Power\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"atomizing\",\"name\":\"喷雾功能\",\"property\":{\"range\":[\"1\",\"2\",\"3\"],\"type\":\"enum\"},\"id\":101,\"type\":\"obj\",\"desc\":\"1:连续喷雾模式；2:间歇喷雾模式；3:关闭喷雾模式\"},{\"mode\":\"rw\",\"code\":\"moodlighting\",\"name\":\"氛围灯\",\"property\":{\"range\":[\"1\",\"2\",\"3\"],\"type\":\"enum\"},\"id\":102,\"type\":\"obj\",\"desc\":\"1:循环模式\\n2:选色模式\\n3:关闭\"},{\"mode\":\"rw\",\"code\":\"light2\",\"name\":\"彩灯\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":103,\"inputType\":\"\"}]"
    },
    "t0TDGBQFFw1AZG1I": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"åŸ€å…³\",\"property\":{\"type\":\"bool\"},\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"æ¨¥åŸ®\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"äºŽåºŒ\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"å†¡æ±–\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"å½Šå…‰æ¨¥åŸ®æ•°\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"æƒ…æ™¯æ¨¥åŸ®æ•°\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"æ»”å…‰æ¨¥åŸ®\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"çŸ¤çº¡æ¨¥åŸ®\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"ç‚å½Šæ¨¥åŸ®\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"æ–‘æ–“æ¨¥åŸ®\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[]"
    },
    "2fISFtnNO1j4GWU4": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"},{\"id\":3,\"inputType\":\"percent\"},{\"id\":4,\"inputType\":\" \"}]"
    },
    "TtXKwTMwiPpURWLJ": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"status\",\"name\":\"门帘状态\",\"property\":{\"range\":[\"0\",\"1\",\"2\",\"3\"],\"type\":\"enum\"},\"id\":1,\"type\":\"obj\",\"desc\":\"开 关 暂停\"}]",
        "schemaExt": "[]"
    },
    "VDy8SyAxa6Q83vvr": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"\"},{\"id\":3,\"inputType\":\"\"},{\"id\":4,\"inputType\":\"\"},{\"id\":5,\"inputType\":\"\"},{\"id\":6,\"inputType\":\"\"}]"
    },
    "0fHWRe8ULjtmnBNd": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time2\",\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"iconname\":\"icon-battery\",\"id\":17,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-Ele\",\"id\":18,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_tool\",\"id\":19,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":5000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-a_function_turbo\",\"id\":20,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"test_bit\",\"name\":\"产测结果位\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":5,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_direction\",\"id\":21,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"voltage_coe\",\"name\":\"电压校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":22,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electric_coe\",\"name\":\"电流校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":23,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"power_coe\",\"name\":\"功率校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":24,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electricity_coe\",\"name\":\"电量校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":25,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"fault\",\"scope\":\"fault\",\"name\":\"故障告警\",\"property\":{\"label\":[\"ov_cr\"],\"type\":\"bitmap\",\"maxlen\":1},\"id\":26,\"type\":\"obj\",\"desc\":\"ov_cr：过流保护\"}]",
        "schemaExt": "[{\"id\":9,\"inputType\":\"\"},{\"id\":17,\"inputType\":\"\"},{\"id\":18,\"inputType\":\"\"},{\"id\":19,\"inputType\":\"\"},{\"id\":20,\"inputType\":\"\"},{\"id\":21,\"inputType\":\"\"},{\"id\":22,\"inputType\":\"\"},{\"id\":23,\"inputType\":\"\"},{\"id\":24,\"inputType\":\"\"},{\"id\":25,\"inputType\":\"\"}]"
    },
    "B6GeaaNA7DTT37Gr": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "CirD9U3eqQ0YKivD": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_3\",\"name\":\"开关3\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB 1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "IGzCi97RpN2Lf9cu": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time2\",\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"iconname\":\"icon-battery\",\"id\":17,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-Ele\",\"id\":18,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_tool\",\"id\":19,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":5000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-a_function_turbo\",\"id\":20,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"test_bit\",\"name\":\"产测结果位\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":5,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_direction\",\"id\":21,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"voltage_coe\",\"name\":\"电压校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":22,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electric_coe\",\"name\":\"电流校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":23,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"power_coe\",\"name\":\"功率校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":24,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electricity_coe\",\"name\":\"电量校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":25,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"fault\",\"scope\":\"fault\",\"name\":\"故障告警\",\"property\":{\"label\":[\"ov_cr\"],\"type\":\"bitmap\",\"maxlen\":1},\"id\":26,\"type\":\"obj\",\"desc\":\"ov_cr：过流保护\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\" \"},{\"id\":9,\"inputType\":\" \"},{\"id\":17,\"inputType\":\" \"}]"
    },
    "mQUhiTg9kwydBFBd": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":3000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\" \"},{\"id\":2,\"inputType\":\" \"}]"
    },
    "n8iVBAPLFKAAAszH": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time\",\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"\"}]"
    },
    "ocNB89IgPygEpdnE": {
        "schema": "[{\"mode\":\"ro\",\"code\":\"switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"id\":101,\"type\":\"obj\",\"desc\":\"上报门窗开关状态\"},{\"mode\":\"ro\",\"code\":\"TamperedAlarm\",\"name\":\"防拆报警\",\"property\":{\"type\":\"bool\"},\"id\":102,\"type\":\"obj\",\"desc\":\"mcu 上报拆除信息\"},{\"mode\":\"ro\",\"code\":\"Battery\",\"name\":\"电池电量\",\"property\":{\"unit\":\"%\",\"min\":0,\"max\":100,\"scale\":0,\"step\":10,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"mcu 上报电池电量信息\"},{\"mode\":\"ro\",\"code\":\"state\",\"name\":\"状态\",\"property\":{\"type\":\"bool\"},\"id\":105,\"type\":\"obj\",\"desc\":\"上报产品是“休眠”还是“离线”\"}]",
        "schemaExt": "[]"
    },
    "PUyaDrOGMhJfCExd": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"trigger\":\"direct\",\"type\":\"obj\",\"desc\":\"上报的为放大1000倍之后的值，即上报56，实际值为0.056度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[{\"id\":2,\"inputType\":\"\"},{\"id\":3,\"inputType\":\"\"},{\"id\":4,\"inputType\":\"\"},{\"id\":5,\"inputType\":\"\"},{\"id\":6,\"inputType\":\"\"}]"
    },
    "rGglRM3FRxUKqJSA": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"basic_indicator\",\"name\":\"状态指示灯\",\"property\":{\"type\":\"bool\"},\"id\":101,\"type\":\"obj\",\"desc\":\"设备指示灯是否打开，true打开，false关闭\"},{\"mode\":\"rw\",\"code\":\"basic_flip\",\"name\":\"录制画面翻转\",\"property\":{\"type\":\"bool\"},\"id\":103,\"type\":\"obj\",\"desc\":\"true反转，false正常\"},{\"mode\":\"rw\",\"code\":\"basic_osd\",\"name\":\"视频osd功能\",\"property\":{\"type\":\"bool\"},\"id\":104,\"type\":\"obj\",\"desc\":\"true打开水印，false关闭水印\"},{\"mode\":\"rw\",\"code\":\"motion_sensitivity\",\"name\":\"移动侦测报警灵敏度\",\"property\":{\"range\":[\"0\",\"1\",\"2\"],\"type\":\"enum\"},\"id\":106,\"type\":\"obj\",\"desc\":\"0-2，灵敏度依次增加；仅为灵敏度，0并不是关闭移动侦测报警；规定0为低灵敏度，1为中灵敏度，2为高灵敏度。\"},{\"mode\":\"ro\",\"code\":\"sd_storge\",\"name\":\"获取SD卡容量\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"id\":109,\"type\":\"obj\",\"desc\":\"示例：\\n---2017.07.08更新---\\n单位改为kb\\n---\\n3503775744|778977280|2718158848\\n其中第一字符串是总容量，第二个字符串是已使用的容量，第三个是剩余容量\"},{\"mode\":\"ro\",\"code\":\"sd_status\",\"name\":\"SD卡状态\",\"property\":{\"unit\":\"\",\"min\":1,\"max\":5,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":110,\"type\":\"obj\",\"desc\":\"status：sd卡状态，1-正常，2-异常，3-空间不足，4-正在格式化，5-无SD卡；\"},{\"mode\":\"rw\",\"code\":\"sd_format\",\"name\":\"格式化存储卡\",\"property\":{\"type\":\"bool\"},\"id\":111,\"type\":\"obj\",\"desc\":\"无参数\"},{\"mode\":\"ro\",\"code\":\"movement_detect_pic\",\"name\":\"移动侦测图片/视频上传\",\"id\":115,\"type\":\"raw\",\"desc\":\"{\\\"dp_id\\\",\\\"bucket;object;key\\\"}/{\\\"dp_id\\\",\\\"bucket;object;\\\"}\\n\\nbucket:根文件夹；objcet:文件路径；key:加密\"},{\"mode\":\"rw\",\"code\":\"ptz_stop\",\"name\":\"停止云台转动\",\"property\":{\"type\":\"bool\"},\"id\":116,\"type\":\"obj\",\"desc\":\"无参数\"},{\"mode\":\"ro\",\"code\":\"sd_format_state\",\"name\":\"格式化状态\",\"property\":{\"unit\":\"\",\"min\":-20000,\"max\":20000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"id\":117,\"type\":\"obj\",\"desc\":\"返回错误码：\\n-2000：SD卡正在格式化\\n-2001：SD卡格式化异常\\n-2002：无SD卡\\n-2003：SD卡错误\\n\\n//正数为格式化进度\"},{\"mode\":\"rw\",\"code\":\"ptz_control\",\"name\":\"云台控制\",\"property\":{\"range\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"0\"],\"type\":\"enum\"},\"id\":119,\"type\":\"obj\",\"desc\":\"direction：方向，共8个;0-上，1-右上，2-右，3-右下，4-下，5-左下，6-左，7-左上\"},{\"mode\":\"rw\",\"code\":\"motion_switch\",\"name\":\"移动侦测报警功能开关\",\"property\":{\"type\":\"bool\"},\"id\":134,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"decibel_switch\",\"name\":\"分贝检测功能开关\",\"property\":{\"type\":\"bool\"},\"id\":139,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"decibel_sensitivity\",\"name\":\"分贝检测灵敏度\",\"property\":{\"range\":[\"0\",\"1\"],\"type\":\"enum\"},\"id\":140,\"type\":\"obj\",\"desc\":\"0代表低灵敏度；1代表高灵敏度\"},{\"mode\":\"ro\",\"code\":\"decibel_upload\",\"name\":\"分贝报警通道\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"id\":141,\"type\":\"obj\",\"desc\":\"用于报警消息推送，app上会显示通知\"}]",
        "schemaExt": "[]"
    },
    "HPiNfakVX1Z9hWsO": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "r15JnoGqWPM4PPtl": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time2\",\"id\":11,\"type\":\"obj\",\"desc\":\"可根据产品实际倒计时功能修改。\"}]",
        "schemaExt": "[]"
    },
    "JtCDjzmKcUNKEBzO": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_s1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_s2\",\"name\":\"开关 2\",\"property\":{\"type\":\"bool\"},\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_s3\",\"name\":\"开关 3\",\"property\":{\"type\":\"bool\"},\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB\",\"property\":{\"type\":\"bool\"},\"id\":4,\"type\":\"obj\",\"desc\":\"switch_s4修改为switch_usb1\"}]",
        "schemaExt": "[]"
    },
    "ScIEYTTGvXy1uuWt": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_3\",\"name\":\"开关3\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB 1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "IAYz2WK1th0cMLmL": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"Power\",\"name\":\"å¼€å…³\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"TempSet\",\"name\":\"ç›®æ ‡æ¸©åº¦\",\"property\":{\"unit\":\"â„ƒ\",\"min\":10,\"max\":70,\"scale\":1,\"step\":5,\"type\":\"value\"},\"iconname\":\"icon-dp_temp\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"TempCurrent\",\"name\":\"å½“å‰æ¸©åº¦\",\"property\":{\"unit\":\"â„ƒ\",\"min\":0,\"max\":100,\"scale\":1,\"step\":5,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"Mode\",\"name\":\"æ¨¡å¼\",\"property\":{\"range\":[\"0\",\"1\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":4,\"type\":\"obj\",\"desc\":\"0ï¼šå‘¨ç¨‹åº\\n1ï¼šæ‰‹åŠ¨\\n\"},{\"mode\":\"rw\",\"code\":\"ECO\",\"name\":\"ECOæ¨¡å¼\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-eco\",\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"ChildLock\",\"name\":\"ç«¥é”\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_lock\",\"id\":6,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"program\",\"name\":\"å‘¨ç¨‹åº\",\"id\":101,\"type\":\"raw\",\"desc\":\"å¯¹åº”æ˜ŸæœŸä¸€~æ˜ŸæœŸäº”ã€æ˜ŸæœŸå…­ã€æ˜ŸæœŸæ—¥ï¼Œæ¯å¤©å…­æ®µï¼Œå¯è®¾ç½®æ¯å°æ—¶çš„æ¸©åº¦èŒƒå›´ã€‚æ¸©åº¦èŒƒå›´ä¸º5-35æ‘„æ°åº¦ã€‚\"},{\"mode\":\"ro\",\"code\":\"floorTemp\",\"name\":\"åœ°æ¿æ¸©åº¦\",\"property\":{\"unit\":\"â„ƒ\",\"min\":0,\"max\":198,\"scale\":1,\"step\":5,\"type\":\"value\"},\"id\":102,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"tempSwitch\",\"name\":\"æ¸©åº¦åˆ‡æ¢\",\"property\":{\"range\":[\"0\",\"1\"],\"type\":\"enum\"},\"id\":103,\"type\":\"obj\",\"desc\":\"0ï¼šå®¤å†…æ¸©åº¦\\n1ï¼šåœ°æ¸©\"},{\"mode\":\"ro\",\"code\":\"floortempFunction\",\"name\":\"åœ°æš–æ¸©åº¦åŠŸèƒ½\",\"property\":{\"type\":\"bool\"},\"id\":104,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[]"
    },
    "eyEYwtdx9VhexxLW": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"å¼€å…³\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"å»¶è¿Ÿ\",\"property\":{\"unit\":\"ç§’\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"ç”µé‡\",\"property\":{\"unit\":\"åº¦\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"ä¸ŠæŠ¥çš„ä¸ºæ”¾å¤§100å€ä¹‹åŽçš„å€¼ï¼Œå³ä¸ŠæŠ¥56ï¼Œå®žé™…å€¼ä¸º0.56åº¦\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"ç”µæµ\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"åŠŸçŽ‡\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"ç”µåŽ‹\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"LED\",\"name\":\"LEDæŽ§åˆ¶\",\"property\":{\"type\":\"bool\"},\"id\":7,\"type\":\"obj\",\"desc\":\"è®¾å¤‡è¾“å‡ºæ—¶å¯é€šè¿‡æ­¤æŽ§ä»¶æŽ§åˆ¶çº¢ç¯äº®ç­\"}]",
        "schemaExt": "[{\"id\":1,\"inputType\":\" \"},{\"id\":2,\"inputType\":\" \"},{\"id\":7,\"inputType\":\" \"}]"
    },
    "gGUj6WJeZHA1QBDU": {
        "schema": "[{\"mode\":\"rw\",\"code\":\"Power\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"id\":1,\"type\":\"obj\",\"desc\":\"开关机控制。\n下发： 发送控制指令给主机，主机依据指令状态进行开关机操作。\n上报：\n当主机使用遥控器关机或者长时间静止进入关机状态后，主机会上报一个关机数据。\n当主机处于关机状态时，通过遥控器或者触摸主机的按键，主机会进入开机状态，主机会上报一个开机数据。\"},{\"mode\":\"ro\",\"code\":\"Error\",\"scope\":\"fault\",\"name\":\"故障\",\"property\":{\"label\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\"],\"type\":\"bitmap\",\"maxlen\":8},\"id\":11,\"type\":\"obj\",\"desc\":\"0 正常；1左边扫异常 ；2右边扫异常 ；3中扫异常 ；4左轮异常；5右轮异常；6风机异常,7 跌落异常 8 主机抬起\n当主机上报后，显示错误代码，当上报0后，清楚显示。\"},{\"mode\":\"ro\",\"code\":\"battery\",\"name\":\"剩余电量\",\"property\":{\"unit\":\"％\",\"min\":0,\"max\":100,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":14,\"type\":\"obj\",\"desc\":\"机器定时上报电量百分比， 0% - 100%\"},{\"mode\":\"rw\",\"code\":\"open\",\"name\":\"开启／暂停按钮\",\"property\":{\"type\":\"bool\"},\"id\":25,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"direction\",\"name\":\"方向\",\"property\":{\"range\":[\"1\",\"2\",\"3\",\"4\",\"5\"],\"type\":\"enum\"},\"id\":26,\"type\":\"obj\",\"desc\":\"向前／后／左／右／停\"},{\"mode\":\"rw\",\"code\":\"mode\",\"name\":\"工作模式\",\"property\":{\"range\":[\"0\",\"1\",\"2\",\"3\",\"4\",\"5\"],\"type\":\"enum\"},\"id\":27,\"type\":\"obj\",\"desc\":\"0: 停止 / 1:自动打扫／2:定点清扫／3:单间打扫／4:沿边打扫／5:自动回充\"},{\"mode\":\"rw\",\"code\":\"fullgo\",\"name\":\"充满清扫\",\"property\":{\"type\":\"bool\"},\"id\":28,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt": "[]"
    },
    "3tDXGiKoVhBYg5zn": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"}]"
    },
    "W7KCgml5Qn2x5T9v": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\" \"},{\"id\":3,\"inputType\":\"percent\"},{\"id\":4,\"inputType\":\"percent\"}]"
    },
    "rrOujSy4Pf1BwEgV": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"工作模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_mode\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩情景\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓情景\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":3,\"inputType\":\"\"},{\"id\":4,\"inputType\":\"\"}]"
    },
    "laI556gLUEUkFd7T": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_sun\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\" \"},{\"id\":3,\"inputType\":\" \"},{\"id\":4,\"inputType\":\" \"}]"
    }
    "6mowdiydpq6sxur9": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_box2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖值\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-a_mode_heat\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_filter\",\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_list\",\"id\":6,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-FanSpeed\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-yanse\",\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_flower\",\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-a_mode_turbo\",\"id\":10,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[]"
    },
    "D7Hl3AxFbHDS98iO": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_3\",\"name\":\"开关3\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_4\",\"name\":\"开关4\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_usb1\",\"name\":\"USB 1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":101,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown2\",\"name\":\"开关2倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":102,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown3\",\"name\":\"开关3倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown4\",\"name\":\"开关4倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":104,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_usb1\",\"name\":\"USB倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":105,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":101,\"inputType\":\"\"},{\"id\":102,\"inputType\":\"\"},{\"id\":103,\"inputType\":\"\"},{\"id\":104,\"inputType\":\"\"},{\"id\":105,\"inputType\":\"\"}]"
    },
    "DEQevYCSHLnbDube": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"temp_value\",\"name\":\"冷暖\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":5,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":6,\"type\":\"obj\",\"desc\":\"rgbhsv\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":14},\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":44},\"id\":10,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"power\",\"name\":\"power\",\"property\":{\"type\":\"bool\"},\"id\":101,\"type\":\"obj\",\"desc\":\"插座开关\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"延迟\",\"property\":{\"unit\":\"S\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":102,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":103,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":104,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":105,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":2500,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":106,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\" \"},{\"id\":2,\"inputType\":\" \"},{\"id\":3,\"inputType\":\" \"},{\"id\":4,\"inputType\":\" \"},{\"id\":101,\"inputType\":\" \"},{\"id\":102,\"inputType\":\" \"},{\"id\":103,\"inputType\":\"\"},{\"id\":104,\"inputType\":\"\"},{\"id\":105,\"inputType\":\"\"},{\"id\":106,\"inputType\":\"\"}]"
    },
    "heeU2AWVxpxfqP6D": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"led_switch\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"work_mode\",\"name\":\"模式\",\"property\":{\"range\":[\"white\",\"colour\",\"scene\",\"scene_1\",\"scene_2\",\"scene_3\",\"scene_4\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_box2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"bright_value\",\"name\":\"亮度值\",\"property\":{\"unit\":\"\",\"min\":25,\"max\":255,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_light2\",\"id\":3,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"colour_data\",\"name\":\"彩光模式数\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_filter\",\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"scene_data\",\"name\":\"情景模式数\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_list\",\"id\":6,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_1\",\"name\":\"柔光模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-FanSpeed\",\"id\":7,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_2\",\"name\":\"缤纷模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-yanse\",\"id\":8,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_3\",\"name\":\"炫彩模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_flower\",\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flash_scene_4\",\"name\":\"斑斓模式\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-a_mode_turbo\",\"id\":10,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"flashscreen\",\"name\":\"新场景\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"iconname\":\"icon-dp_house\",\"id\":11,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\"plain\"},{\"id\":3,\"inputType\":\"percent\"}]"
    },
    "oSQljE9YDqwCwTUA": {
        "schema":"[{\"mode\":\"ro\",\"code\":\"status\",\"name\":\"开关状态\",\"property\":{\"range\":[\"open\",\"closed\"],\"type\":\"enum\"},\"iconname\":\"icon-dp_direction\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"BatteryStatus\",\"name\":\"电池电量\",\"property\":{\"range\":[\"0x00\",\"0x01\",\"0x02\",\"0x03\"],\"type\":\"enum\"},\"id\":101,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[]"
    },
    "qxJSyTLEtX5WrzA9": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"switch_on\",\"name\":\"开关\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power3\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown\",\"name\":\"倒计时\",\"property\":{\"unit\":\"秒\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":2,\"type\":\"obj\",\"passive\":true,\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"度\",\"min\":0,\"max\":500000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"id\":3,\"type\":\"obj\",\"desc\":\"上报的为放大100倍之后的值，即上报56，实际值为0.56度\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":4,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":5,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":3000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"id\":6,\"type\":\"obj\",\"desc\":\"\"}]",
        "schemaExt":"[]"
    },
    "Xg7AvNi7aeRqW3fD": {
        "schema":"[{\"mode\":\"rw\",\"code\":\"switch_1\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":1,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"switch_2\",\"name\":\"开关2\",\"property\":{\"type\":\"bool\"},\"iconname\":\"icon-dp_power2\",\"id\":2,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_1\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time2\",\"id\":9,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"countdown_2\",\"name\":\"开关2倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_time2\",\"id\":10,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"rw\",\"code\":\"add_ele\",\"name\":\"增加电量\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100,\"type\":\"value\"},\"iconname\":\"icon-battery\",\"id\":17,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_current\",\"name\":\"当前电流\",\"property\":{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-Ele\",\"id\":18,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_power\",\"name\":\"当前功率\",\"property\":{\"unit\":\"W\",\"min\":0,\"max\":50000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_tool\",\"id\":19,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"cur_voltage\",\"name\":\"当前电压\",\"property\":{\"unit\":\"V\",\"min\":0,\"max\":5000,\"scale\":1,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-a_function_turbo\",\"id\":20,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"test_bit\",\"name\":\"产测结果位\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":5,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-dp_direction\",\"id\":21,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"voltage_coe\",\"name\":\"电压校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":22,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electric_coe\",\"name\":\"电流校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":23,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"power_coe\",\"name\":\"功率校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":24,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"electricity_coe\",\"name\":\"电量校准系数\",\"property\":{\"unit\":\"\",\"min\":0,\"max\":1000000,\"scale\":0,\"step\":1,\"type\":\"value\"},\"iconname\":\"icon-gaodiyin\",\"id\":25,\"type\":\"obj\",\"desc\":\"\"},{\"mode\":\"ro\",\"code\":\"fault\",\"scope\":\"fault\",\"name\":\"故障告警\",\"property\":{\"label\":[\"ov_cr\"],\"type\":\"bitmap\",\"maxlen\":1},\"id\":26,\"type\":\"obj\",\"desc\":\"ov_cr：过流保护\"}]",
        "schemaExt":"[{\"id\":1,\"inputType\":\"plain\"},{\"id\":2,\"inputType\":\"plain\"},{\"id\":9,\"inputType\":\"plain\"},{\"id\":10,\"inputType\":\"plain\"},{\"id\":17,\"inputType\":\" \"},{\"id\":18,\"inputType\":\"\"},{\"id\":19,\"inputType\":\"\"},{\"id\":20,\"inputType\":\"\"},{\"id\":21,\"inputType\":\"\"},{\"id\":22,\"inputType\":\"\"},{\"id\":23,\"inputType\":\"\"},{\"id\":24,\"inputType\":\"\"},{\"id\":25,\"inputType\":\"\"}]"
    }

};
knownSchemas.keymc4hxajv4947f = knownSchemas.XjGNEvQmy6OXtEGF;

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
        if (!def.property) {
            return;
        }
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
            case 'enum':
                common.type = 'number';
                if (def.property.range && Array.isArray(def.property.range)) {
                    common.states = {};
                    def.property.range.forEach((val, index) => {
                        common.states[index] = val;
                    });
                    if (def.desc !== '') {
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

        common.read  = (def.mode === 'ro' || def.mode === 'rw');
        common.write = (def.mode === 'rw');
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
