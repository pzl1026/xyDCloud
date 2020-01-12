const {ipcMain, dialog} = require('electron');
const user = require('../application/user');
const {STORE_PREFIX, DEVICE_ACTION_FEILDS, VIDEO_ACTION_FEILDS, DEVICE_VIDEO_ACTION_FEILDS} = require('../config/store');
const _ = require('lodash');
const StreamDownload = require('../helper/download2');
const {shell} = require("electron");
const {getIPAdress} = require('../helper/ip');


// 定义回调函数
function downloadFileCallback(arg, percentage)
{
    if (arg === "progress")
    {
        console.log(percentage, 'percentage');
        // 显示进度
    }
    else if (arg === "finished")
    {
        // 通知完成
        console.log('下载成功')
    }
}

function startDownload(fileInfo) {
    const StreamDownload2 = new StreamDownload();

    // 调用下载
    StreamDownload2.downloadFile(fileInfo.url, fileInfo.dir, fileInfo.filename, downloadFileCallback)
}

function setDownloadVideoInfo () {
    // 
}

// 保存视频的信息，并新增可操作字段
function saveDevicesVideos(data) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore.devices.map(item => {
        if (item.ip == data.ip) {
            data.videos.forEach(m => {
                let isset = item['media-files'].find(n => n.kbps == m.kbps);
                if (!isset) {
                    item['media-files'].unshift({
                        ...m,
                        ...DEVICE_VIDEO_ACTION_FEILDS
                    });
                }
            });
        }
        return item;
    });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices.find(m => m.ip == data.ip)['media-files'];
}

function changeDevicesVideosDownload(data) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore.devices.map(item => {
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
    return userStore.devices.find(m => m.ip == data.ip)['media-files'];
}

// 保存设备
function saveDevice (device) {
    // console.log(device, 'saveDevice')
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore.devices) {
        userStore.devices = [];
    }
    userStore.devices.push(Object.assign({}, device, DEVICE_ACTION_FEILDS));
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 保存路径
function setDeviceLocalpath(ip, localPath){
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices = userStore.devices.map(item => {
        if (item.ip == ip) {
            item.localPath = localPath;
        }
        return item;
    });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 删除设备
function deleteDevice (ip) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.devices =  userStore.devices.filter(m => m.ip != ip);
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.devices;
}

// 获取当前下载的设备
function getDevices () {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    return userStore.devices;
}

// 轮询监听是否可下载
function loopStartDownload() {
    // 判断是否全局暂停，
}

// 账号登出，或软件退出取消群论监听
function clearLoop() {

}


!(function ipcDevice() {
    // 该事件项目页面监听 轮询监听是否文件更新
    ipcMain.on('post-ip-address', (event, data) => {
        // 获取已设置的项目任务
        const myHost = getIPAdress();

        event.reply('get-ip-address', myHost);
    });

    ipcMain.on('start-download', (event, data) => {
        // 获取已设置的项目任务
        startDownload();

        event.reply('get-ip-address', myHost);
    });

    ipcMain.on('save-device', (event, device) => {
        // 获取已设置的项目任务
        let devices = saveDevice(device);
        event.reply('render-device', devices);
    });

    ipcMain.on('get-devices', (event) => {
        // 获取已设置的项目任务
        let devices = getDevices();
        event.reply('render-device-list', devices);
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

    // 设置项目目录
    ipcMain.on('save-device-videos', (event, data) => {
        let videos = saveDevicesVideos(data);
        event.reply('render-device-videos', videos);
    });

        // 选择视频下载
        ipcMain.on('change-device-videos-download', (event, data) => {
            let videos = changeDevicesVideosDownload(data);
            event.reply('render-device-videos', videos);
        });




})();