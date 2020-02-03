// 全局属性
// 网络监听
// 下载失败监听
// 本地用户信息
var Store = require('electron-store');

var globalInit = (function () {
    let store = new Store();
    return function () {
        global.attrs = {
            NET_IS_CONNECT: false, //是否有网络
            DOWNLOAD_FAILED_PROJECT: false, //项目下载是否失败
            DOWNLOAD_FAILED_BOX: false, //合资下载是否失败
            USER_INFO: 'USER_INFO',           //用户信息字段 （store）
            PROJECTS_VIDEOS: 'PROJECTS_VIDEOS',   //所有项目下载的视频对应字段（store）
            BOX_VIDEOS: 'BOX_VIDEOS',           //所有盒子下载的视频的对应字段（store）
            CURRENT_DOWN_PROJECT_FILE: null,  //当前项目下载的文件信息
            CURRENT_DOWN_BOX_FILE: null,    //当前盒子下载的文件信息
            IS_PAUSE_PROJECT: false,    //项目文件下载是否暂停
            IS_PAUSE_BOX: false,         //盒子文件下载是否暂停
            STORE:store,
        };
        global.store = store;
        global.USER_ID = '';
        global.IS_PROJECT_DOWNLOADING = false;
        global.IS_DEVICE_DOWNLOADING = false;
        global.DOWNLOADING_VIDEO = null;
        global.DOWNLOADING_DEVICE_VIDEO = null;
        global.NEED_LOOP_DOWNLOAD = null;
        global.DEVICE_SEARCHING = false;
        global.LINE_STATUS = true;
        global.VOLUMN_NOTICE_TIMER = null;
    };
})();

module.exports = globalInit;
