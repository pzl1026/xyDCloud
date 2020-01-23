const {ipcMain, dialog} = require('electron');
const user = require('../application/user');
const {STORE_PREFIX, DEVICE_ACTION_FEILDS, VIDEO_ACTION_FEILDS, DEVICE_VIDEO_ACTION_FEILDS} = require('../config/store');
const _ = require('lodash');
const StreamDownload = require('../helper/download2');
const {shell} = require("electron");
const {getIPAdress, getVlan} = require('../helper/ip');
const pinging = require('../helper/ping');

// 定义下载成功或者下载中回调函数
function downloadFileCallback(arg, percentage) {
    if (arg === "progress") {
        console.log(percentage, 'percentage');
        // 显示进度
    } else if (arg === "finished") {
        // 通知完成
        console.log('下载成功');
        let userStore = store.get(STORE_PREFIX + USER_ID);
        userStore
            .devices
            .forEach(item => {
                if (DOWNLOADING_DEVICE_VIDEO.ip == item.ip) {
                    let successTime = new Date().valueOf();
                    item.successTime = successTime;
                    item['media-files'].forEach(m => {
                        if (DOWNLOADING_DEVICE_VIDEO.kbps === m.kbps) {
                            m.isSuccess = true;
                            m.successTime = successTime;
                            m.downloadProgress = 1;
                        }
                    });
                }
            });
        store.set(STORE_PREFIX + USER_ID, userStore);
        setTimeout(() => {
            startDownload();
        }, 2000);
    }
}

// 定义下载失败的回调
function downloadErrorCallback(err, msg, statusCode) {
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore
        .devices
        .forEach(item => {
            if (DOWNLOADING_DEVICE_VIDEO.ip == item.ip) {
                item.failReason = DOWNLOADING_DEVICE_VIDEO.name + msg;
                item['media-files'].forEach(m => {
                    if (DOWNLOADING_DEVICE_VIDEO.kbps === m.kbps) {
                        m.isFail = true;
                        m.failReason = msg;
                        m.failTime = new Date().valueOf();
                    }
                });
            }
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
}

function startDownload() {
    const StreamDownload2 = new StreamDownload();
    let userStore = store.get(STORE_PREFIX + USER_ID);
    let device = userStore
        .devices
        .find(item => !item.isPause);
    if (device) {
        let video = device['media-files'].find(m => m.needDownload && !m.isSuccess && !m.isFail);
        if (video) {
            DOWNLOADING_DEVICE_VIDEO = {
                ip: device.ip,
                localPath: device.localPath,
                ...video
            };
            // todo:: 进行网络判断，进行容量判断，进行设备状态判断
            console.log(video, 'video')
            // 调用下载
            StreamDownload2.downloadFile(video.downpath, device.localPath, video.name, downloadFileCallback, downloadErrorCallback);
        } else {
            IS_DEVICE_DOWNLOADING = false;
        }
    } else {
        IS_DEVICE_DOWNLOADING = false;
    }
}

function setDownloadVideoInfo() {
    //
}

// 保存视频的信息，并新增可操作字段
function saveDevicesVideos(data) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .map(item => {
            if (item.ip == data.ip) {
                data
                    .videos
                    .forEach(m => {
                        let isset = item['media-files'].find(n => n.kbps == m.kbps);
                        if (!isset) {
                            item['media-files'].push({
                                ...m,
                                ...DEVICE_VIDEO_ACTION_FEILDS
                            });
                        }
                    });
            }
            return item;
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore
        .devices
        .find(m => m.ip == data.ip)['media-files'];
}

function changeDevicesVideosDownload(data) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .map(item => {
            if (item.ip == data.ip) {
                item['media-files'].forEach(m => {
                    if (data.videosKbps.includes(m.kbps)) {
                        m.needDownload = true;
                    }
                });
            }
            return item;
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore
        .devices
        .find(m => m.ip == data.ip)['media-files'];
}

// 保存设备
function saveDevice(device) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore.devices) {
        userStore.devices = [];
    }
    userStore
        .devices
        .push(Object.assign({}, device, DEVICE_ACTION_FEILDS));
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 保存路径
function setDeviceLocalpath(ip, localPath) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .map(item => {
            if (item.ip == ip) {
                item.localPath = localPath;
            }
            return item;
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 删除设备
function deleteDevice(ip) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .filter(m => m.ip != ip);
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 获取当前下载的设备
function getDevices() {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    return userStore.devices;
}

// 轮询监听是否可下载
function loopStartDownload() {
    // 判断是否全局暂停，
}

// 账号登出，或软件退出取消群论监听
function clearLoop() {}

!(function ipcDevice() {
    // 该事件项目页面监听 轮询监听是否文件更新
    ipcMain.on('post-ip-address', (event, data) => {
        // 获取本机IP
        const myHost = getIPAdress();

        event.reply('get-ip-address', myHost);
    });

    ipcMain.on('start-download', (event, data) => {
        // 开始下载
        if (!IS_DEVICE_DOWNLOADING) {
            IS_DEVICE_DOWNLOADING = true;
            startDownload();
        }

        event.reply('get-ip-address', myHost);
    });

    ipcMain.on('save-device', (event, device) => {
        // 保存设备
        let devices = saveDevice(device);
        event.reply('render-device', devices);
    });

    ipcMain.on('get-devices', (event) => {
        // 获取设备
        let devices = getDevices();
        event.reply('render-device-list', devices || []);
    });

    // 打开项目目录
    ipcMain.on('open-device-dir', (event, localPath) => {
        shell.showItemInFolder(localPath);
    });

    // 打开文件夹窗口
    ipcMain.on('open-folder-dialog-device', (event, device) => {
        // 打开文件夹
        dialog
            .showOpenDialog(mainWindow, {
            properties: ['openDirectory', 'createDirectory']
        })
            .then(res => {
                // 返回文件夹路径
                const localPath = res.filePaths[0];
                let devices = setDeviceLocalpath(device.ip, localPath);
                event.reply('render-device-list', devices);
            });
    });

    // 设置项目目录
    ipcMain.on('delete-device', (event, device) => {
        let devices = deleteDevice(device.ip);
        event.reply('render-device-list', devices);
    });

    // 设置设备视频
    ipcMain.on('save-device-videos', (event, data) => {
        let videos = saveDevicesVideos(data);
        event.reply('render-device-videos', videos);
    });

    // 选择视频下载
    ipcMain.on('change-device-videos-download', (event, data) => {
        let videos = changeDevicesVideosDownload(data);
        if (!IS_DEVICE_DOWNLOADING) {
            IS_DEVICE_DOWNLOADING = true;
            startDownload();
        }
        event.reply('render-device-videos', videos);
    });

    // 获取所有设备视频
    ipcMain.on('post-devices-videos', (event, data) => {
        let userStore = store.get(STORE_PREFIX + USER_ID);
        event.reply('get-devices-videos', userStore.devices);
    });

     // 获取是否正在搜索设备状态
     ipcMain.on('post-devices-searching', (event) => {
        event.reply('get-devices-searching', DEVICE_SEARCHING);
    });

    // 获取可用设备
    ipcMain.on('post-can-devices', (event) => {
        let devicesIps = [];
        if(DEVICE_SEARCHING) {
            return;
        }
        DEVICE_SEARCHING = true;
        pinging(getVlan(), {
            pingCb: () => {},
            pingStatusCb: () => {},
            pingStatusSuccess: (host) => {
                console.log(host, 'host');
                devicesIps.push(host);
                // event.reply('complete-devices-search', videos);
            },
            pingAllStatusCb: () => {
                console.log('状态获取完成');
                DEVICE_SEARCHING = false;
                event.reply('complete-devices-search', devicesIps);
            }
        });
        // event.reply('render-device-videos', videos);
    });

    // 改变是否暂停下载
    ipcMain.on('change-device-pause-status', (event, ip) => {
        // 对某个项目的路径进行设置
        let userStore = store.get(STORE_PREFIX + USER_ID);

        userStore.devices = userStore
            .devices
            .map(item => {
                if (item.ip == ip) {
                    item.isPause = !item.isPause;
                }
                return item;
            });

        store.set(STORE_PREFIX + USER_ID, userStore);
        event.reply('render-device', userStore.devices);
    });

})();