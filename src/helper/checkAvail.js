var spawn = require('child_process').spawn;
var os = require('os');
var process = require('child_process');

function getAvailVolumn(fn, disc) {
    return os.type() == 'Darwin' ? getAvailVolumnForMac(fn) : getAvailVolumnForWin(fn, disc);
}

function getAvailVolumnForWin(fn, disc) {
    process.exec(`wmic LogicalDisk where "Caption=\'${disc}\'" get FreeSpace`, function(error, stdout, stderr) {
        // console.log("error:"+error);
        // console.log(stdout);
        // console.log("stdout:"+typeof(stdout));
        // console.log("stderr:"+stderr);
        let arr = stdout.split('\n').splice(1);
        let avail = parseInt(arr.join('').replace(/\r|\n|\s/g, ''));
        fn && fn(avail);
    });
}

function getAvailVolumnForMac(fn) {
    let free = spawn('df', ['-h']);
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
        // console.log('standard output:\n' + data + '\n');
        let str =  Uint8ArrayToString(data);
        let arr = str.split('\n').splice(1);
        let allDisc = [];
        for (var i = 0; i < arr.length; i++) {
            // console.log('standard output22:\n' + arr[i] + '\n');
            let disInfostr = arr[i];
            let firstDualSpaceIndex = arr[i].indexOf('  ');
            let lastOtherStr = disInfostr.substr(firstDualSpaceIndex);
            let lastOtherStrArr = lastOtherStr.split(' ').filter(m => m);
            if (lastOtherStrArr.length == 0) break;
            // console.log(lastOtherStrArr, 'lastOtherStrArr \n')
            let o ={
                disc: arr[i].substr(0, arr[i].indexOf('  ')),
                size: '',
                used: '',
                avail: '',
                used_percent: '',
                mounted: ''
            }
            lastOtherStrArr.forEach((m, k) => {
                switch(k) {
                    case 0: 
                        o.size = volumn2Byte(m);
                        break;
                    case 1: 
                        o.used = volumn2Byte(m);
                        break;
                    case 2: 
                        o.avail = volumn2Byte(m);
                        break;
                    case 3: 
                        o.used_percent = m;
                        break;
                    case 4: 
                        os.type() == 'Windows_NT' ? o.mounted = m : '';
                        break;
                    case 7: 
                        os.type() == 'Darwin' ? o.mounted = m : '';
                        break;
                }
            });
            allDisc.push(o);
        }
        // console.log(allDis/c, 'ar\n');
        if (os.type() == 'Darwin') {
            let avail = allDisc[0].avail;
            fn && fn(avail);
        } else {
            fn && fn(allDisc);
        }
    });

    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
    // console.log('standard error output:\n' + data);
    });
    
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
    // console.log('child process eixt ,exit:' + code);
    });
}

function volumn2Byte(str) {
    let GNumber = parseFloat(str);
    return GNumber * Math.pow(1024, 3);
}

function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
   
    return dataString
  
}

function stringToUint8Array(str){
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
   
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}

module.exports = getAvailVolumn;
