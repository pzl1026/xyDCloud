const _ = require('lodash');
const {STORE_PREFIX} = require('../config/store');
// const disk = require('diskusage'); const os = require('os');
// getFreeSpace('/');

function downListeners() {
    mainWindow
        .webContents
        .session
        .on('will-download', (event, item, webContents) => {
            // 设置保存路径,使Electron不提示保存对话框。
            item.setSavePath(DOWNLOADING_VIDEO.localPath + '/' + DOWNLOADING_VIDEO.name + '.' + DOWNLOADING_VIDEO.ext);
            // DOWNLOADING_VIDEO.progress = 0;
            function handleFail(msg) {
                setSuccessOrFail(0, msg).then(() => {
                    IS_PROJECT_DOWNLOADING = false;
                    if (!Notification.isSupported()) return;
                    let noticeMsg = `${DOWNLOADING_VIDEO.projectName}/${DOWNLOADING_VIDEO.name}文件下载失败`;
                    let notification = new Notification({title: '新阅', subtitleString:'下载提示', body: noticeMsg});
                    notification.show();
                });
            }

            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    // console.log('Download is interrupted but can be resumed');
                    // item.resume()
                    handleFail('下载被中断');
                } else if (state === 'progressing') {
                    // if (item.isPaused()) {
                    //     console.log('Download is paused')
                    // } else {
                    //     console.log(`Received bytes: ${item.getReceivedBytes()}`)
                    // }
                    // DOWNLOADING_VIDEO.progress += item.getReceivedBytes();
                    let percent = parseFloat(item.getReceivedBytes() / DOWNLOADING_VIDEO.size).toFixed(2);
                    setVideoProgress(percent);
                }
            })
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    // console.log('Download successfully');
                    setSuccessOrFail(1).then(() => {
                        startDownloading();
                    });
                } else {
                    // console.log(`Download failed: ${state}`)
                    handleFail(`Download failed: ${state}`);
                }
            })
        });

    // setTimeout(function () {
    // mainWindow.webContents.downloadURL('http://video2.uxinyue.com/Act-ss-mp4-ld/a
    // 8
    // 46ee7b59144f61bfabe8cd2b55f534/95d48f76e4dd86780f3bb1d59600451d-ed0fb0984d6e3
    // 1 48afb17af08574000b.mp4'); }, 1000)
}

// 进度通过渲染进程轮询获取
function setVideoProgress(percent) {
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore
        .projects
        .forEach(item => {
            if (item.id != DOWNLOADING_VIDEO.projectId) return;
            item
                .videos
                .forEach(m => {
                    if (m.id == DOWNLOADING_VIDEO.id) {
                        m.downloadProgress = percent;
                    }
                });
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
}

function setSuccessOrFail(isSuccess, msg) {
    let timeInt = new Date().valueOf();
    return new Promise((resolve, reject) => {
        let userStore = store.get(STORE_PREFIX + USER_ID);
        userStore
            .projects
            .forEach(item => {
                item
                    .videos
                    .forEach(m => {
                        if (m.id == DOWNLOADING_VIDEO.id) {
                            if (isSuccess) {
                                m.isSuccess = true;
                                m.successTime = timeInt;
                                m.isFail = false;
                            } else {
                                m.isFail = true;
                                m.failTime = timeInt;
                                m.failReason = msg;
                            }
                        }
                    });
            });
        store.set(STORE_PREFIX + USER_ID, userStore);
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

//检查磁盘容量
async function getFreeSpace(path) {
    try {
        const {free} = await disk.check(path);
        console.log(`Free space: ${free}`);
        return free
    } catch (err) {
        console.error(err)
        return 0
    }
}

function startDownloading() {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    if (!userStore) return;
    if (!userStore.projects || userStore.projects.length == 0) 
        return;
    let projects = userStore
        .projects
        .map(item => {
            if (item.videos) {
                item.videos = item
                    .videos
                    .map(m => {
                        m.localPath = item.localPath;
                        return m;
                    });
            }
            return item;
        });
    let downloadingProjects = projects.filter(m => !m.isPause && m.localPath);
    let downloadVideos = _.flatten(downloadingProjects.map(item => item.videos.map(video => {
        return {
            ...video,
            projectName: item.name,
            projectId: item.id
        }
    })));

    DOWNLOADING_VIDEO = downloadVideos.find(item => !item.isSuccess);
    // if (DOWNLOADING_VIDEO.isFail) {     IS_PROJECT_DOWNLOADING = false;
    // return; }
    if (!DOWNLOADING_VIDEO) {
        //判断是不是没有文件要下载了，如果没有了，轮询等待是否有新文件
        IS_PROJECT_DOWNLOADING = false;
        return;
    }
    console.log('start-download');
    // todo:: 进行网络判断，进行容量判断

    mainWindow
        .webContents
        .downloadURL(DOWNLOADING_VIDEO.url);
}

function loopDownload() {
    NEED_LOOP_DOWNLOAD = setInterval(() => {
        // console.log(IS_PROJECT_DOWNLOADING, 'NEED_LOOP_DOWNLOAD')
        if (IS_PROJECT_DOWNLOADING) 
            return;
        IS_PROJECT_DOWNLOADING = true;
        startDownloading();
    }, 5000);
}

module.exports = {
    downListeners,
    startDownloading,
    loopDownload
};
