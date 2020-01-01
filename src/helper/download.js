const _ = require('lodash');
const {STORE_PREFIX} = require('../config/store');

function downListeners() {
    mainWindow
        .webContents
        .session
        .on('will-download', (event, item, webContents) => {
            console.log(DOWNLOADING_VIDEO, 'event, item, webContents')
            // 设置保存路径,使Electron不提示保存对话框。
            item.setSavePath(DOWNLOADING_VIDEO.localPath + '/' + DOWNLOADING_VIDEO.name + '.' + DOWNLOADING_VIDEO.ext);

            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed');
                    // item.resume()
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused')
                    } else {
                        console.log(`Received bytes: ${item.getReceivedBytes()}`)
                    }
                }
            })
            item.once('done', (event, state) => {
                console.log(state, 'state')
                if (state === 'completed') {
                    console.log('Download successfully');
                    setSuccessOrFail(1).then(() => {
                        startDownloading();
                    });
                } else {
                    console.log(`Download failed: ${state}`)
                }
            })
        });

    // setTimeout(function () {
    //     mainWindow.webContents.downloadURL('http://video2.uxinyue.com/Act-ss-mp4-ld/a846ee7b59144f61bfabe8cd2b55f534/95d48f76e4dd86780f3bb1d59600451d-ed0fb0984d6e3148afb17af08574000b.mp4');
    // }, 1000)
}

function setSuccessOrFail(isSuccess) {
    return new Promise ((resolve, reject) => {
        let userStore = store.get(STORE_PREFIX + USER_ID);
        userStore.projects.forEach(item => {
            item.videos.forEach(m => {
                if (m.id == DOWNLOADING_VIDEO.id) {
                    m.isSuccess = true;
                }
            });
        });
        store.set(STORE_PREFIX + USER_ID, userStore);
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

function startDownloading() {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore.projects || userStore.projects.length == 0) return;
    let projects = userStore
        .projects
        .map(item => {
            item.videos = item
                .videos
                .map(m => {
                    m.localPath = item.localPath;
                    return m;
                });
            return item;
        });        
    let downloadingProjects = projects.filter(m => !m.isPaused && m.localPath);
    let downloadVideos = _.flatten(downloadingProjects.map(item => item.videos));

    DOWNLOADING_VIDEO = downloadVideos.find(item => !item.isSuccess);
    if (!DOWNLOADING_VIDEO) {
        //判断是不是没有文件要下载了，如果没有了，轮询等待是否有新文件
        IS_PROJECT_DOWNLOADING = false;
        return;
    }
    console.log(DOWNLOADING_VIDEO, 'startDownloading')
    mainWindow
        .webContents
        .downloadURL(DOWNLOADING_VIDEO.url);
}

function loopDownload() {
    console.log(2222)
    NEED_LOOP_DOWNLOAD = setInterval(() => {
        if (IS_PROJECT_DOWNLOADING) return;
        IS_PROJECT_DOWNLOADING = true;
        startDownloading();
    }, 5000);
}

module.exports = {
    downListeners,
    startDownloading,
    loopDownload
};
