module.exports = function(adapter, callback) {
    adapter.log.debug('init anyproxy rule');
    return {
        summary: 'Catch Tuya Data from Response',
        *beforeSendResponse(requestDetail, responseDetail) {
            const body = responseDetail.response.body.toString('utf8');
            if (body.includes('tuya.m.my.group.device.list')) {
                let response;
                try {
                    response = JSON.parse(body);
                }
                catch (err) {
                    adapter.log.debug('Anyproxy: error checking response');
                    return null;
                }
                callback(response);
                return null;
            }
        },

        *beforeDealHttpsRequest(requestDetail) {
            return requestDetail.host.includes('tuya');
        }
    };
};
