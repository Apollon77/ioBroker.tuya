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
        return this.cloudApi.request({ action: 'tuya.m.location.list' });
    }

    async getGroupDevices(groupId) {
        return this.cloudApi.request({action: 'tuya.m.my.group.device.list', gid: groupId});
    }

    async getGroupSchemas(groupId) {
        return this.cloudApi.request({
            action: 'tuya.m.device.ref.info.my.list',
            gid: groupId,
            v: '2.0'
        });
    }

    async set(gid, devId, dps) {
        return this.cloudApi.request({
            action: 'tuya.m.device.dp.publish',
            gid,
            data: {
                devId,
                gwId: devId,
                dps
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
