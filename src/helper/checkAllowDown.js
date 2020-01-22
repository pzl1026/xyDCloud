var checkAvail = require('./checkAvail');
var os = require('os');

// mac检查容量
function checkAllowAvailForMac(size) {
    let avail = checkAvail();
    if(avail <= size) {
        
    } else {
        
    }
}

// windows检查容量
function checkAllowAvailForWin() {
    return new Promise((resolve, reject) => {

    });
}

// 判断网络
function checkNetStatus() {
    return new Promise((resolve, reject) => {

    });
}

// 检查设备是否可用
function checkDeviceStatus() {
    return new Promise((resolve, reject) => {

    });
}

// 检查所有状态是否正常
function checkAllowDown (size, ip = '', fn) {
    if (os.type() == 'Darwin') {
        checkAllowAvailForMac(() => {
            
        });
    } else {
        checkAllowAvailForWin(() => {

        })
    }
}

module.exports = checkAllowDown;

