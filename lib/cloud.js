const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const REGIONS = ['eu', 'us', 'cn', 'in'];

class TuyaCloud {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.apiSecret = options.apiSecret;
        if (options.region) this.region = options.region;
        if (options.userId) this.userId = options.userId;
        this.options = options;
    }

    initApi() {
        if (!this.userId || !this.region || !this.apiKey || !this.apiSecret) {
            throw new Error('Cloud data not initialized correctly.');
        }
        if (this._api) return;

        this._api = new TuyaContext({
            baseUrl: this.regionToUrl(this.region),
            accessKey: this.apiKey,
            secretKey: this.apiSecret
        });
    }

    async initFromKnownDevice(deviceId) {
        const regions = this.region ? [this.region] : REGIONS;
        const errs = [];

        for (const region of regions) {
            try {
                const api = new TuyaContext({
                    baseUrl: this.regionToUrl(region),
                    accessKey: this.apiKey,
                    secretKey: this.apiSecret
                });

                const result = await api.request({
                    method: 'GET',
                    path: `/v1.0/devices/${deviceId}`
                });

                if (result.success && result.result) {
                    this.userId = result.result.uid;
                    this.region = region;
                    return;
                }
                errs.push(new Error(`${region}: ${result.code}: ${result.msg}`));
            } catch (err) {
                errs.push(err);
            }
        }

        throw new Error(`Could not find User details by Device: ${JSON.stringify(errs)}`);
    }

    async getUserDevices() {
        this.initApi();

        // Get user devices
        const result = await this._api.request({
            method: 'GET',
            path: `/v1.0/users/${this.userId}/devices`
        });

        if (!result.success) {
            throw new Error(`${result.code}: ${result.msg}`);
        }

        const groupedDevices = {};
        for (const device of result.result) {
            if (device.node_id) {
                if (!groupedDevices[device.local_key] || !groupedDevices[device.local_key].subDevices) {
                    groupedDevices[device.local_key] = {...groupedDevices[device.local_key], subDevices: []};
                }

                groupedDevices[device.local_key].subDevices.push(device);
            } else {
                groupedDevices[device.local_key] = {...device, ...groupedDevices[device.local_key]};
            }
        }
    }

    async initFromLoginCredentials(deviceId) {
        this.initApi();

        // Get user devices
        const result = await this._api.request({
            method: 'POST',
            path: `/v1.0/iot-01/associated-users/actions/authorized-login`,
            body: {
                "username": "188xxxx22",
                "password": "9cbxxxxxxx9a0",
                "country_code": 86,
                "schema": "tuyaSmart"
            }
        });

        // {
        //   "result": {
        //     "access_token": "48643baf0xxxxx9f8efa",
        //     "expire_time": 7200,
        //     "refresh_token": "656adfccxxxxfe43e91bea",
        //     "uid": "ay15xxxxxxx8Ot"
        //   },
        //   "success": true,
        //   "t": 1621909749209
        // }

        if (!result.success) {
            throw new Error(`${result.code}: ${result.msg}`);
        }

        // TODO
        return result.result;

    }

    async getDeviceSpecification(deviceId) {
        this.initApi();

        // Get user devices
        const result = await this._api.request({
            method: 'GET',
            path: `/v1.1/devices/${deviceId}/specifications`
        });

        if (!result.success) {
            throw new Error(`${result.code}: ${result.msg}`);
        }

        const res = {
            schema: {},
            schemaExt: {}
        };



        // TODO
        return result.result;

    }


    regionToUrl(region) {
        return `https://openapi.tuya${region}.com`;
    }
}

modules.export = TuyaCloud;
