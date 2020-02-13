const {ipcMain, dialog, Notification} = require('electron');
const user = require('../application/user');
const {STORE_PREFIX, DEVICE_ACTION_FEILDS, VIDEO_ACTION_FEILDS, DEVICE_VIDEO_ACTION_FEILDS} = require('../config/store');
const _ = require('lodash');
const StreamDownload = require('../helper/download2');
const checkAllowDown = require('../helper/checkAllowDown');
const {shell} = require("electron");
const {getIPAdress, getVlan} = require('../helper/ip');
const pinging = require('../helper/ping');
const createNotification = require('../helper/notification');

// 定义下载成功或者下载中回调函数
function downloadFileCallback(arg, percentage, fn, event) {
    if (arg === "progress") {
        // console.log(percentage, 'percentage');
        // 显示进度
    } else if (arg === "finished") {
        // 通知完成
        console.log('下载成功');
        let userStore = store.get(STORE_PREFIX + USER_ID);
        userStore.devices = userStore.devices.map(item => {
                    if (DOWNLOADING_DEVICE_VIDEO.tid == item.tid) {
                        let successTime = new Date().valueOf();
                        item.successTime = successTime;
                        item.failReason = '';
                        item['media-files'] = item['media-files'].map(m => {
                            if (DOWNLOADING_DEVICE_VIDEO.kbps === m.kbps) {
                                m.isSuccess = true;
                                m.successTime = successTime;
                                m.downloadProgress = 1;
                                m.isFail = false;
                                m.failReason = '';
                                m.isCompleted = true;
                            }
                            return m;
                        });
                    }
                    item.isSuccess = item['media-files'].every(m => m.isSuccess);
                    item.isCompleted = item['media-files'].every(m => m.isSuccess || m.isFail);
                    return item;
                });
        store.set(STORE_PREFIX + USER_ID, userStore);
        event.reply('get-devices-videos', userStore.devices);
        event.reply('render-device', userStore.devices);
        setTimeout(() => {
            startDownload(fn);
        }, 2000);
    }
}

// 定义下载失败的回调
function downloadErrorCallback(err, msg, statusCode, fn, event) {
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore
        .devices
        .forEach(item => {
            if (DOWNLOADING_DEVICE_VIDEO.tid == item.tid) {
                item.failReason = DOWNLOADING_DEVICE_VIDEO.name + '  '+ msg;
                item['media-files'].forEach(m => {
                    if (DOWNLOADING_DEVICE_VIDEO.kbps === m.kbps) {
                        m.isFail = true;
                        m.failReason = msg;
                        m.failTime = new Date().valueOf();
                        m.isCompleted = true;
                    }
                });
                item.isFail = item['media-files'].some(m => m.isFail);
                item.isCompleted = item['media-files'].every(m => m.isSuccess || m.isFail);
            }
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    event.reply('get-devices-videos', userStore.devices);
    event.reply('render-device', userStore.devices);
    setTimeout(() => {
        startDownload(fn);
    }, 2000);
}

function startDownload(fn) {
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore.devices) {
        IS_DEVICE_DOWNLOADING = false;
        return;
    }
    let device = userStore
        .devices
        .find(item => !item.isPause && !item.isCompleted);
    if (device && LINE_STATUS) {
        let video = device['media-files'].find(m => !m.isSuccess && !m.isFail);
        if (video) {
            DOWNLOADING_DEVICE_VIDEO = {
                ip: device.ip,
                tid: device.tid,
                deviceName: device.product['product-name'],
                ...video,
                localPath: device.localPath
            };
            // todo:: 进行容量判断，进行设备状态判断(已在前端请求判断)
            checkAllowDown(video.size, device.localPath)
            .then(() => {
                VOLUMN_NOTICE_TIMER = null;
                fn && fn(DOWNLOADING_DEVICE_VIDEO);
            }, (disc) => {
                IS_DEVICE_DOWNLOADING = false;
                if (VOLUMN_NOTICE_TIMER) {
                    return;
                }
                VOLUMN_NOTICE_TIMER = setTimeout(() => {
                    VOLUMN_NOTICE_TIMER = null;
                }, 300000);
                createNotification('提示', `系统${disc}容量不够，请保证有足够的下载容量，且不能小于1G`);
            });
            // // 调用下载
            // const StreamDownload2 = new StreamDownload();
            // StreamDownload2.downloadFile(video.downpath, device.localPath, video.name, downloadFileCallback, downloadErrorCallback);
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
                if (item.localPath == '') {
                    item.localPath = data.localPath;
                }
                item['media-files'] = item['media-files'].map(m => {
                    if (data.videosKbps.includes(m.kbps)) {
                        // m.needDownload = true;
                        // m.localPath =  data.localPath;
                        m = {
                            ...m, 
                            ...VIDEO_ACTION_FEILDS,
                            needDownload: true,
                            localPath: data.localPath
                        };
                    }
                    return m;
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
    if (!userStore.devices.find(m => m.ip == device.ip)) {
        userStore
            .devices
            .push(Object.assign({}, device, DEVICE_ACTION_FEILDS));
        store.set(STORE_PREFIX + USER_ID, userStore);
    }
    return userStore.devices;
}

// 保存设备任务
function saveDevice2(device) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore.devices) {
        userStore.devices = [];
    }
    device = {
        ...device,
        ...DEVICE_ACTION_FEILDS,
        tid: parseInt(Math.random() * 1000000)
    }
    device['media-files'] = device['media-files'].map(m => {
        return {
            ...m,
            ...DEVICE_VIDEO_ACTION_FEILDS
        };
    });
    userStore.devices.push(device);
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 保存路径
function setDeviceLocalpath(tid, localPath) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .map(item => {
            if (item.tid == tid) {
                item.localPath = localPath;
            }
            return item;
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 删除设备
function deleteDevice(tid) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore
        .devices
        .filter(m => m.tid != tid);
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

// 账号登出，或软件退出取消轮询监听
function clearLoop() {}

!(function ipcDevice() {
    //
    ipcMain.on('get-devices', (event, data) => {
        // 获取本机IP
        const myHost = getIPAdress();

        event.reply('get-ip-address', myHost);
    });
    
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
            startDownload((DOWNLOADING_DEVICE_VIDEO) => {
                event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
            });
        }
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
                if (res.canceled) return;
                // 返回文件夹路径
                const localPath = res.filePaths[0];
                let devices = setDeviceLocalpath(device.tid, localPath);
                event.reply('render-device-list', devices);
            });
    });

        // 打开文件夹窗口
        ipcMain.on('open-folder-dialog-file', (event, device) => {
            // 打开文件夹
            dialog
                .showOpenDialog(mainWindow, {
                properties: ['openDirectory', 'createDirectory']
            })
                .then(res => {
                    if (res.canceled) return;
                    // 返回文件夹路径
                    const localPath = res.filePaths[0];
                    event.reply('video-localpath', localPath);
                });
        });

    // 设置项目目录
    ipcMain.on('delete-device', (event, device) => {
        let devices = deleteDevice(device.tid);
        event.reply('render-device-list', devices);
    });

    // 设置设备视频
    ipcMain.on('save-device-videos', (event, data) => {
        let videos = saveDevicesVideos(data);
        event.reply('render-device-videos', videos);
    });

    // 创建设备下载任务
    ipcMain.on('change-device-videos-download', (event, data) => {
        // let videos = changeDevicesVideosDownload(data);
        let devices = saveDevice2(data);
        if (!IS_DEVICE_DOWNLOADING) {
            IS_DEVICE_DOWNLOADING = true;
            startDownload((DOWNLOADING_DEVICE_VIDEO) => {
                event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
            });
        }
        // event.reply('selected-video', DOWNLOADING_DEVICE_VIDEO);
        event.reply('render-device', devices);
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
                // console.log(host, 'host');
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
    ipcMain.on('change-device-pause-status', (event, tid) => {
        // 对某个项目的路径进行设置
        let userStore = store.get(STORE_PREFIX + USER_ID);

        userStore.devices = userStore
            .devices
            .map(item => {
                if (item.tid == tid) {
                    item.isPause = !item.isPause;
                }
                return item;
            });

        store.set(STORE_PREFIX + USER_ID, userStore);
        if (!IS_DEVICE_DOWNLOADING) {
            IS_DEVICE_DOWNLOADING = true;
            startDownload((DOWNLOADING_DEVICE_VIDEO) => {
                event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
            });
        }
        event.reply('render-device', userStore.devices);
    });

    ipcMain.on('clear-devices', (event) => {
        let userStore = store.get(STORE_PREFIX + USER_ID);
        userStore.devices = [];
        store.set(STORE_PREFIX + USER_ID, userStore);
    });

    ipcMain.on('change-device-status', (event, data) => {
        let deviceVideo = data.deviceVideo;
        if(data.statusData.result == 0) {
            // 调用下载
            console.log('startdownload');
            const StreamDownload2 = new StreamDownload();
            StreamDownload2.downloadFile(
                deviceVideo.downpath, 
                deviceVideo.localPath, 
                deviceVideo.name, 
                (arg, percentage) => {
                    downloadFileCallback(arg, percentage, (DOWNLOADING_DEVICE_VIDEO) => {
                        event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
                    }, event);
                }, 
                (err, msg, statusCode) => {
                    downloadErrorCallback(err, msg, statusCode, (DOWNLOADING_DEVICE_VIDEO) => {
                        event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
                    }, event);
                },
                DOWNLOADING_DEVICE_VIDEO.ip);
        } else {
            IS_DEVICE_DOWNLOADING = false;
            let userStore = store.get(STORE_PREFIX + USER_ID);
            let device = userStore.devices.find(m => m.tid == deviceVideo.tid);;
            createNotification('提示', `请重新链接${device.name}设备`);
        }
    });

    // 初始化启动客户端检查，如果用户登录直接开始下载
    ipcMain.on('device-start-download', (event, data) => {
        if (!IS_DEVICE_DOWNLOADING) {
            IS_DEVICE_DOWNLOADING = true;
            startDownload((DOWNLOADING_DEVICE_VIDEO) => {
                event.reply('check-device-status', DOWNLOADING_DEVICE_VIDEO);
            });
        }
    });
})();