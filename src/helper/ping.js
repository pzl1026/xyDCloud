var ping = require('ping');
const request = require('request');
// const {getVlan} = require('./ip');

const pinging = (function () {
    let requestCount = 0;
    let pingCount = 0;
    let hosts = [];
    let hostAlives = [];
    let vlan = '';
    let pingCb = () => {};
    let pingStatusCb = () => {};
    let pingAllStatusCb = () => {};
    let pingStatusSuccess = () => {};
    const ipsLength = 256;

    function startPing(vlanIp, opt) {
        pingCb = opt.pingCb;
        pingStatusCb = opt.pingStatusCb;
        pingAllStatusCb = opt.pingAllStatusCb;
        pingStatusSuccess = opt.pingStatusSuccess;
        vlan = vlanIp;

        for (var i = 1; i < ipsLength; i++) {
            let host = vlan + i;
            hosts.push(host);
        }
        // hosts.forEach(function(host){
        //     ping.sys.probe(host, function(isAlive){
        //         console.log(host, isAlive, 'isAlive')
        //         pingCount++;
        //         if (isAlive) {
        //             hostAlives.push(host);
        //         }
        //         pingCb();
        //         console.log(pingCount, ipsLength, 'ipsLength')
        //         if (pingCount >= ipsLength - 1) {
        //             console.log(9999)
        //             if (hostAlives.length == 0) {
        //                 hosts = [];
        //                 hostAlives = [];
        //                 pingCount = 0;
        //                 requestCount = 0;
        //                 pingAllStatusCb();
        //             } else {
        //                 requestHostApi(hostAlives[0]);
        //             }

        //         }
        //     });
        // });
        hosts.forEach(function (host) {
            ping.promise.probe(host, {
                timeout: 10,
                // extra: ["-i 2"],
            }).then(function (res) {
                pingCount++;
                if (res.alive) {
                    hostAlives.push(host);
                }
                pingCb();
                if (pingCount >= ipsLength - 1) {
                    if (hostAlives.length == 0) {
                        hosts = [];
                        hostAlives = [];
                        pingCount = 0;
                        requestCount = 0;
                        pingAllStatusCb();
                    } else {
                        requestHostApi(hostAlives[0]);
                    }

                }
            });
        });
    }
    
    function requestHostApi(host) {
        // console.log(requestCount, hostAlives.length, 'requestCount')
        if (requestCount == hostAlives.length) {
            hosts = [];
            hostAlives = [];
            pingCount = 0;
            requestCount = 0;
            pingAllStatusCb();
            return;
        }
        findUseHost(host);
    }
    
    function delayRequest() {
        setTimeout(() => {
            requestCount++;
            requestHostApi(hostAlives[requestCount]);
        }, 100);
    }
    
    function findUseHost(host) {
        return new Promise((resolve) => {
            request
                .get(`http://${host}/usapi?method=get-info`)
                .on('response', function (response) {
                    // console.log(host, response.statusCode, 'status') // 200
                    //   console.log(response.headers['content-type']) 
                    delayRequest();
                    pingStatusCb(response);
                    if (response.statusCode == 200) {
                        pingStatusSuccess(host);
                    }
                })
                .on('error', function (err) {
                    // console.log(err, 'err'),
                    delayRequest();
                    pingStatusCb(err);
                });
        });
    
    }

    return startPing;
})();
// pinging(getVlan(), {
//     pingCb: () => {},
//     pingStatusCb: () => {},
//     pingStatusSuccess: (host) => {
//         console.log(host, 'host');
//     },
//     pingAllStatusCb: () => {
//         console.log('状态获取完成')
//     }
// });

module.exports = pinging;


