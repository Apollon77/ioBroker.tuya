const Cloud = require('@tuyapi/cloud');

class AppCloud {

    constructor(username, password, region, appType, appDeviceId, appSessionId, appRegion, appEndpoint) {
        this.username = username;
        this.password = password;

        if (!appSessionId) {
            appSessionId = undefined;
        }
        if (!appDeviceId) {
            appDeviceId = undefined;
        }
        if (!appRegion) {
            appRegion = undefined;
        }
        if (!appEndpoint) {
            appEndpoint = undefined;
        }

        if (appType === 'tuya_smart') {
            this.apiKeys = {
                ttid: 'tuya',
                key: '3fjrekuxank9eaej3gcx',
                certSign: '93:21:9F:C2:73:E2:20:0F:4A:DE:E5:F7:19:1D:C6:56:BA:2A:2D:7B:2F:F5:D2:4C:D5:5C:4B:61:55:00:1E:40',
                secret2: 'vay9g59g9g99qf3rtqptmc3emhkanwkx',
                secret: 'aq7xvqcyqcnegvew793pqjmhv77rneqc',
            };
        } else {
            this.apiKeys = {
                ttid: 'smart_life',
                key: 'ekmnwp9f5pnh3trdtpgy',
                secret: 'r3me7ghmxjevrvnpemwmhw3fxtacphyg',
                secret2: 'jfg5rs5kkmrj5mxahugvucrsvw43t48x',
                certSign: '0F:C3:61:99:9C:C0:C3:5B:A8:AC:A5:7D:AA:55:93:A2:0C:F5:57:27:70:2E:A8:5A:D7:B3:22:89:49:F8:88:FE',
            }
        }

        this.cloudApi = new Cloud({
            key: this.apiKeys.key,
            secret: this.apiKeys.secret,
            secret2: this.apiKeys.secret2,
            certSign: this.apiKeys.certSign,
            apiEtVersion: '0.0.1',
            region: appRegion || region || 'EU',
            ttid: this.apiKeys.ttid,
            deviceID: appDeviceId,
            sid: appSessionId,
            endpoint: appEndpoint
        });
    }

    async login() {
        const loginResult = await this.cloudApi.loginEx({
            email: this.username,
            password: this.password,
            returnFullLoginResponse: true
        });
        this.lastLoginResult = loginResult;
        return loginResult.sid;
    }

    async getTime() {
        return this.cloudApi.request({action: 'tuya.p.time.get'});
    }

    async getLocationList() {
        return this.cloudApi.request({
            action: 'tuya.m.location.list',
            version: '2.1'
        });
    }

    async getGroupDevices(groupId) {
        return this.cloudApi.request({
            action: 'tuya.m.my.group.device.list',
            gid: groupId,
            version: '2.0'
        });
    }

    async getGroupSchemas(groupId) {
        return this.cloudApi.request({
            action: 'tuya.m.device.ref.info.my.list',
            gid: groupId,
            version: '2.0'
        });
    }

    async set(gid, devId, gwId, dps) {
        return this.cloudApi.request({
            action: 'tuya.m.device.dp.publish',
            gid,
            data: {
                devId,
                gwId,
                dps
            }
        });
    }

    async report(gid, devId, gwId, dps) {
        return this.cloudApi.request({
            action: 'tuya.m.device.dp.report',
            version: '2.0',
            gid,
            data: {
                devId,
                gwId,
                dps: JSON.stringify(dps),
                dpsTime: Math.floor(Date.now() / 1000)
            }
        });
    }


    async getMonthlyStats(gid, devId, dpId) {
        return this.cloudApi.request({
            action: 'tuya.m.dp.stat.month.list',
            gid,
            data: {
                devId,
                gwId: devId,
                dpId,
                type: 'sum'
            }
        });
    }

    /**
     *
     * @param gid
     * @param devId
     * @param dpId
     * @param startDay format new Date().toISOString().slice(0, 10).replace(/-/g, '');
     * @param endDay format new Date().toISOString().slice(0, 10).replace(/-/g, '');
     * @returns {Promise<Object>}
     */
    async getDailyStats(gid, devId, dpId, startDay, endDay) {
        return this.cloudApi.request({
            action: 'tuya.m.dp.stat.days.list',
            gid,
            data: {
                devId,
                gwId: devId,
                dpId,
                startDay,
                endDay,
                type: 'sum'
            }
        });
    }
}

module.exports = AppCloud;


/*

Other commands:
await cloudApi.request({action: 'tuya.m.device.sub.list', data: {devId: deviceId, gwId: deviceId , meshId: data.meshId}});

await cloudApi.request({action: 'tuya.m.infrared.record.get', data: {devId: deviceId, gwId: deviceId , subDevId: deviceId, vender: '3'}});

await cloudApi.request({gid: cloudDeviceGroups[deviceId], action: 'tuya.m.infrared.key.get', data: {devId: deviceId, gwId: deviceId , devTypeId: infraredRecord.devTypeId, vender: infraredRecord.vender}});

await appCloudApi.cloudApi.request({gid: cloudDeviceGroups[deviceId], action: 'tuya.m.infrared.device.extended.information', data: {devId: deviceId, gwId: data.meshId , devTypeId: 1, vender: infraredRecord.vender}});



a: tuya.m.device.dp.report
v: 2.0

AC On
postData {"devId":"bf8cb607dc76b538b1v56v","dps":"{\"101\":true,\"102\":\"0\",\"103\":19,\"104\":\"0\"}","dpsTime":"1667948434","gwId":"bf90851a27705b2de3rwll"}

AC Off
postData {"devId":"bf8cb607dc76b538b1v56v","dps":"{\"101\":false,\"102\":\"0\",\"103\":19,\"104\":\"0\"}","dpsTime":"1667948436","gwId":"bf90851a27705b2de3rwll"}




Szenen abrufen
gid 69557442
a tuya.m.linkage.rule.query
v 4.0

ohne postdata


result:
"result": [{
  "matchType": 1,
  "offGwSync": false,
  "outOfWork": 0,
  "ownerId": "69557442",
  "logicRule": false,
  "offGwSyncSuccess": false,
  "id": "RkETSgfkfRaAA7qv",

Szene ausführen
a tuya.m.linkage.rule.trigger
v 1.0

postData {"ruleId":"RkETSgfkfRaAA7qv"}


{
  "apis": [
    {
      "a": "tuya.m.my.group.device.relation.list",
      "et": "0.0.1",
      "v": "1.0" / "2.0"
    },
    {
      "a": "tuya.m.my.group.device.sort.list",
      "et": "0.0.1",
      "params": { "gid": "..." },
      "v": "1.0"
    },
    {
      "a": "tuya.m.my.group.device.list",
      "et": "0.0.1",
      "v": "1.0"
    },
    {
      "a": "tuya.m.my.group.mesh.list",
      "et": "0.0.1",
      "v": "1.0"
    },
    {
      "a": "tuya.m.device.sig.mesh.list",
      "et": "0.0.1",
      "v": "1.0"
    },
    {
      "a": "tuya.m.my.group.device.group.list",
      "et": "0.0.1",
      "v": "2.0"
    },
    {
      "a": "tuya.m.location.get",
      "et": "0.0.1",
      "params": { "gid": ... },
      "v": "2.0"
    },
    {
      "a": "tuya.m.device.ref.info.my.list",
      "et": "0.0.1",
      "params": { "zigbeeGroup": true },
      "v": "2.0" / "4.0"
    },
    {
      "a": "tuya.m.my.shared.device.list",
      "et": "0.0.1",
      "v": "1.0"
    },
    {
      "a": "tuya.m.my.shared.device.group.list",
      "et": "0.0.1",
      "v": "2.0"
    }
  ]
}
 */
