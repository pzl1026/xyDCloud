const { ipcMain, Notification, app } = require('electron');
const {shell} = require("electron");
const createNotification = require('../helper/notification');

function ipcInit() {
    // store.clear();
    require('./user');
    require('./project');
    require('./device');

    ipcMain.on('post-current-version', (event) => {
        let package = require('../../package.json');
        event.reply('save-current-version', package.version);
    });

    ipcMain.on('open-version-url', (event, url) => {
        console.log(url);
        shell.openExternal(url);
    });

    // ipcMain.on('check-user-info', (event) => {
    //     // 如果没有登录，
    //     // 触发页面跳转到登录页面

    //     // 如果登陆了，将个人信息发送到页面
    //     event.reply('get-user-info', 'pong')
    // });

    // require('./user');

    // ipcMain.on('store-device', (event) => {
    //     // 获取所有的设备视频存储到store

    //     // 获取之后，将所有设备数据发送到页面
    //     event.reply('render-device', 'pong')
    // });

    ipcMain.on('change-line-status', (event, status) => {
        LINE_STATUS = status ? 1 : 0;
        console.log(LINE_STATUS, 'LINE_STATUS');
        if (status == 1) {
            createNotification('提示', '网络已断开');
        }
    });

    ipcMain.on('change-start-login', (event, openAtLogin) => {
    
        app.setLoginItemSettings({
            openAtLogin, // Boolean 在登录时启动应用
            // openAsHidden: true, // Boolean (可选) mac 表示以隐藏的方式启动应用。~~~~
            // path: '', String (可选) Windows - 在登录时启动的可执行文件。默认为 process.execPath.
            // args: [] String Windows - 要传递给可执行文件的命令行参数。默认为空数组。注意用引号将路径换行。
        })
    });

    ipcMain.on('project-mapping-localpath', (event) => {
        // 项目映射本地文件夹

        // 映射成功后告知页面
        event.reply('notice-htm', '本地目录设置成功')
    });

    ipcMain.on('device-mapping-localpath', (event) => {
        // 设备映射本地文件夹

        // 获取之后，将所有设备数据发送到页面
        event.reply('notice-htm', '本地目录设置成功')
    });

    ipcMain.on('network-outage', (event) => {
        // 网络中断

        // 获取之后，将所有消息发送到页面
        event.reply('notice-htm', '网络已中断')
    });

    // 该事件页面全局监听
    ipcMain.on('pfile-download', (event) => {
        // 项目文件下载处理

        // 文件下载进度
        // 当页面在项目页时，发送下载进度
        event.reply('pfile-downloading', '下载中 50%');

        // 项目文件下载失败
        event.reply('pfile-fail', '下载失败');

        // 项目文件下载成功，发送某个文件成功状态
        // 当页面在项目下载记录时
        event.reply('pfile-success', '下载成功');
    });

    // 该事件页面全局监听
    ipcMain.on('dfile-download', (event) => {
        // 设备文件下载处理

        // 文件下载进度
        // 当页面在设备页时，发送下载进度
        event.reply('dfile-downloading', '下载中 50%');

        // 设备文件下载失败
        event.reply('dfile-fail', '下载失败');

        // 设备文件下载成功，发送某个文件成功状态
        // 当页面在设备下载记录页时
        event.reply('dfile-success', '下载成功');
    });


    // 设备列表页监听
    ipcMain.on('device-update', (event) => {
        // 设备列表更新

        // 当设备数发生更新时，触发页面渲染，仅在设备列表页时触发
        event.reply('device-render', '设备有更新');
    });

    // 设备列表页监听
    ipcMain.on('device-file-update', (event) => {
        // 某个设备文件列表更新

        // 当某个设备视频数发生更新时，触发页面渲染，仅在设备视频列表页时触发
        event.reply('device-file-render', '设备文件有更新');
    });
}

module.exports = ipcInit;