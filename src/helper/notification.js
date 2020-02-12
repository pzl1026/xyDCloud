const { Notification, Tray } = require('electron')
var os = require('os');
var path = require('path');

function createNotification(subtitleString, body) {
    let trayIcon = path.join(__dirname, '../../img/');
    if (!Notification.isSupported()) return;
    let notification = new Notification({
        title: '新阅', 
        subtitleString, 
        body, 
        icon:  os.type() == 'Darwin' ? trayIcon + 'app.ico' : trayIcon + 'app.ico'
    });
    notification.show();
}

module.exports = createNotification;