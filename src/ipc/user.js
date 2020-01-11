const { ipcMain } = require('electron');
const user = require('../application/user');
const {loopDownload} = require('../helper/download');

!(function ipcUser() {
    ipcMain.on('check-user-info', (event) => {
        // 如果没有登录，
        // 触发页面跳转到登录页面

        // 如果登陆了，将个人信息发送到页面
        event.reply('get-user-info', 'pong')
    });

    ipcMain.on('save-user', (event, data) => {
        // 登录触发逻辑处理
        // 存储登录信息到store，成功之后跳转页面
        let userInfo = user.getUser(data);
        if (!userInfo) {
            user.storeUser(data);
        }
        global.USER_INFO = userInfo;
        global.USER_ID = data.login_id;
        loopDownload();
      
        // 登录了之后，将个人信息发送到页面
        event.reply('store-client-user', data);
    });

    ipcMain.on('clear-loop', (event, data) => {
        clearInterval(NEED_LOOP_DOWNLOAD);
        NEED_LOOP_DOWNLOAD = null;
        USER_ID = '';
        event.reply('login-out');
    });
})();