var ping = require('ping');
var createNotification = require('./notification');
const {STORE_PREFIX, DEVICE_ACTION_FEILDS, VIDEO_ACTION_FEILDS, DEVICE_VIDEO_ACTION_FEILDS} = require('../config/store');

(function() {
    let listenerTimer = null;
    let noticeIsAlready = false;

    setInterval(pingPass, 1000);

    function pingPass() {
        let pingErrDevices = [];
        let userStore = store.get(STORE_PREFIX + USER_ID);
        if (!userStore || !userStore.devices || LINE_STATUS == 1) return;
        userStore.devices.forEach((item, index) => {
            ping.promise.probe(item.ip, {
                timeout: 10,
                // extra: ["-i 2"],
            }).then(function (res) {
                if (res.alive) {
                   item.isConnect = true;
                } else {
                    item.isConnect = false;
                    pingErrDevices.push(item);
                }

                store.set(STORE_PREFIX + USER_ID,  userStore);

                if (index == userStore.devices.length - 1 && pingErrDevices.length > 0 && noticeIsAlready == false) {
                    listenerTimer = setTimeout(() => {
                        noticeIsAlready = false;
                        clearTimeout(listenerTimer);
                    }, 5 * 60 * 1000);
                    noticeIsAlready = true;
                    pingErrDevices.forEach(m => {
                        createNotification('设备状态', m.name + '链接异常,请重新搜索链接');
                    });
                }
            });
        });
    }
}());
