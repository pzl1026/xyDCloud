var checkAvail = require('./checkAvail');
var os = require('os');
const request = require('request');

// mac检查容量
function checkAllowAvailForMac(size) {
    return new Promise((resolve, reject) => {
        let avail = checkAvail();
        if(avail <= size + Math.pow(1024, 3)) {
            reject();
        } else {
            resolve();
        }
    })
}

// windows检查容量
function checkAllowAvailForWin(size, localPath, avail) {
    return new Promise((resolve, reject) => {
        let disc = localPath.substr(0, localPath.indexOf(':') + 1);
        let availDisc = avail.find(n => n.mounted.indexOf(disc) > -1);
        
        if (size < availDisc.avail + Math.pow(1024, 3)) {
            resolve();
        } else {
            reject(disc);
        }
    });
}

// 检查所有状态是否正常
function checkAllowDown (size, localPath) {
    return new Promise((resolve, reject) => {
        checkAvail((avail) => {
            if (os.type() == 'Darwin') {
                if(avail <= size + Math.pow(1024, 3)) {
                    reject('');
                } else {
                    resolve();
                }
            } else {
                let disc = localPath.substr(0, localPath.indexOf(':') + 1);
                let availDisc = avail.find(n => n.mounted.indexOf(disc) > -1);
                
                if (size < availDisc.avail + Math.pow(1024, 3)) {
                    resolve();
                } else {
                    reject(disc);
                }
            }
        });
    });
}
module.exports = checkAllowDown;

