const os = require('os');
///////////////////获取本机ip///////////////////////
function getIPAdress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function getVlan() {
    let host = getIPAdress();
    if (!host) return;
    return host.substr(0, host.lastIndexOf('.')) + '.';
}

module.exports = {
    getVlan,
    getIPAdress
}