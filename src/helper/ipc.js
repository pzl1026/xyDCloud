const { ipcMain } = require('electron');


function ipcInit() {

    ipcMain.on('asynchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.reply('asynchronous-reply', 'pong')
    })
      
    ipcMain.on('synchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.returnValue = 'pong'
    })

    ipcMain.on('check-user-info', (event) => {
        // 如果没有登录，
        // 触发页面跳转到登录页面

        // 如果登陆了，将个人信息发送到页面
        event.reply('get-user-info', 'pong')
    });

    ipcMain.on('save-user', (event, data) => {
        // 登录触发逻辑处理
        // 存储登录信息到store，成功之后跳转页面
        console.log(data, '666')
        const store = global.attrs.STORE;
        // store.delete('user_' + data.id);
        store.set('user_' + data.id, data);
        console.log(store.get('user_' + data.id), 'ooo');

        // 登录了之后，将个人信息发送到页面
        // event.reply('reply-user', 'pong')
    });

    ipcMain.on('store-projects', (event) => {
        // 获取所有的项目视频存储到store

        // 获取之后，将所有项目数据发送到页面
        event.reply('render-projects', 'pong')
    });

    ipcMain.on('store-device', (event) => {
        // 获取所有的设备视频存储到store

        // 获取之后，将所有设备数据发送到页面
        event.reply('render-device', 'pong')
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

    // 该事件项目页面监听
    // 轮询监听是否文件更新
    ipcMain.on('loop-project-update', (event) => {
        // 轮询监听的项目列表更新

        // 当项目数发生更新时，触发页面渲染，仅在项目列表页时触发
        event.reply('project-render', '项目有更新');
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