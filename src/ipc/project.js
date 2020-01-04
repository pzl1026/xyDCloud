const {ipcMain, dialog} = require('electron');
const user = require('../application/user');
const {STORE_PREFIX, PROJECT_ACTION_FEILDS, VIDEO_ACTION_FEILDS} = require('../config/store');
const _ = require('lodash');
const {downListeners, startDownloading} = require('../helper/download');
const { shell } = require("electron");

/**
 * 保存项目到本地
 * @param {*} list
 */
function saveProjects(list) {
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.projects = list.map(item => {
        if (!userStore.projects) {
            return Object.assign({}, item, PROJECT_ACTION_FEILDS);
        }

        let isset = userStore
            .projects
            .find(n => n.id == item.id);
        if (isset) {
            return isset;
        }
        return Object.assign({}, item, PROJECT_ACTION_FEILDS);
    });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.projects.filter(m => m.localPath && m.isCreated);
}

/**
 * 保存项目视频信息到本地
 * @param {*} list
 */
function saveProjectsVideos(data) {
    let userStore = user.getUserById(data.loginId);
    userStore.projects = userStore
        .projects
        .map(item => {
            if (!item.videos) {
                item.videos = [];
            }
            let currentProject = data
                .videos
                .find(m => m.project_id == item.id);
            if (currentProject) {
                let currentProjectVideos = currentProject.list;
                currentProjectVideos.forEach(m => {
                    if (!item.videos.find(n => n.id == m.id)) {
                        item
                            .videos
                            .push(Object.assign({}, m, VIDEO_ACTION_FEILDS));
                    }
                });
            }

            return item;
        });
    const store = attrs.STORE;
    store.set(STORE_PREFIX + USER_ID, userStore);
}

/**
 * 设置项目路径
 */
function saveProjectPath(data) {
    if (!data.projectId || !data.localPath) 
        return;
    const store = attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);

    userStore
        .projects
        .forEach(item => {
            if (item.id == data.projectId) {
                item.localPath = data.localPath;
                item.isPause = false;
                item.isCreated = true;
            }
        });
    store.set(STORE_PREFIX + USER_ID, userStore);
    return userStore.projects.filter(m => m.localPath && m.isCreated);
}

!(function ipcProject() {
    downListeners();
    // 该事件项目页面监听 轮询监听是否文件更新
    ipcMain.on('get-setting-projects', (event, data) => {
            // 获取已设置的项目任务
            let userStore = store.get(STORE_PREFIX + USER_ID);
            let projectsSeted = [];
            if (userStore.projects) {
                projectsSeted = userStore.projects.filter(m => m.localPath && m.isCreated)
            }
            
            event.reply('render-setting-projects', projectsSeted.map(m => m.id));
    });
    // 该事件项目页面监听 轮询监听是否文件更新
    ipcMain.on('save-projects', (event, data) => {
        // 轮询监听的项目列表更新
        let projects = saveProjects(data.projects);
        // 当项目数发生更新时，触发页面渲染，仅在项目列表页时触发
        event.reply('project-render', projects);
    });

    ipcMain.on('save-projects-video', (event, data) => {
        // 保存项目文件
        saveProjectsVideos(data);

        // 当项目数发生更新时，触发页面渲染，仅在项目列表页时触发
        event.reply('project-video-render', '项目有更新');
    });

    // 打开文件夹窗口
    ipcMain.on('open-folder-dialog', (event) => {
        // 打开文件夹
        dialog
            .showOpenDialog(mainWindow, {
            properties: ['openDirectory', 'createDirectory']
        })
            .then(res => {
                // 返回文件夹路径
                const localPath = res.filePaths[0];
                event.reply('fetch-folder-dialog', localPath);
            });
    });

    // 保存项目本地路径
    ipcMain.on('save-project-path', (event, data) => {
        // 对某个项目的路径进行设置
        let projects = saveProjectPath(data);
        // 如果刚新建第一个就开始下载；
        if (!IS_PROJECT_DOWNLOADING) {
            IS_PROJECT_DOWNLOADING = true;
            startDownloading();
        }
        event.reply('create-project-path', projects);
    });

    // 改变是否暂停下载
    ipcMain.on('change-pause-status', (event, projectId) => {
        // 对某个项目的路径进行设置
        let userStore = store.get(STORE_PREFIX + USER_ID);

        userStore.projects = userStore.projects.map(item => {
            if (projectId == item.id) {
                item.isPause = !item.isPause;
            }
            return item;
        });

        store.set(STORE_PREFIX + USER_ID, userStore);
        event.reply('changed-pause-status', userStore.projects.filter(m => item.localPath && item.isCreated));
    });

    // 打开项目目录
    ipcMain.on('open-project-dir', (event, projectId) => {
        let userStore = store.get(STORE_PREFIX + USER_ID);
        let project = userStore.projects.find(item => item.id == projectId);
        shell.showItemInFolder(project.localPath);
    });
})();
