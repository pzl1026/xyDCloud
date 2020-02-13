var checkAvail = require('./checkAvail');
var os = require('os');

// 检查所有状态是否正常
function checkAllowDown (size, localPath) {
    return new Promise((resolve, reject) => {
        let disc = localPath.substr(0, localPath.indexOf(':') + 1);
        checkAvail((avail) => {
            if(avail <= size + Math.pow(1024, 3)) {
                reject();
            } else {
                resolve();
            }
            // if (os.type() == 'Darwin') {
            //     if(avail <= size + Math.pow(1024, 3)) {
            //         reject('');
            //     } else {
            //         resolve();
            //     }
            // } else {
            //     console.log(avail, 'avail')
            //     let disc = localPath.substr(0, localPath.indexOf(':') + 1);
            //     let availDisc = avail.find(n => n.mounted.indexOf(disc) > -1);
                
            //     if (size < availDisc.avail + Math.pow(1024, 3)) {
            //         resolve();
            //     } else {
            //         reject(disc);
            //     }
            // }
        }, os.type() == 'Darwin' ? undefined : disc);
    });
}
module.exports = checkAllowDown;

