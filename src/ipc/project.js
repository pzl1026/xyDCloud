const { ipcMain } = require('electron');
const user = require('../application/user');
const {STORE_PREFIX, PROJECT_ACTION_FEILDS, VIDEO_ACTION_FEILDS} = require('../config/store');
const _ = require('lodash');

/**
 * 保存项目到本地
 * @param {*} list 
 */
function saveProjects (list) {
    const store = global.attrs.STORE;
    let userStore = store.get(STORE_PREFIX + USER_ID);
    userStore.projects = list.map(item => {
        if (!userStore.projects) {
            return Object.assign({}, item, PROJECT_ACTION_FEILDS);
        }
        
        let isset = userStore.projects.find(n => n.id == item.id);
        if (isset) {
            return isset;
        }
        return Object.assign({}, item, PROJECT_ACTION_FEILDS);
    });
    store.set(STORE_PREFIX + USER_ID, userStore);
}

/**
 * 保存项目视频信息到本地
 * @param {*} list 
 */
function saveProjectsVideos(data) {
    let userStore = user.getUserById(data.loginId);
    userStore.projects = userStore.projects.map(item => {
        if (!item.videos) {
            item.videos = [];
        }
        let currentProject = data.videos.find(m => m.project_id == item.id);
        if (currentProject) {
            let currentProjectVideos = currentProject.list;
            currentProjectVideos.forEach(m => {
                if (!item.videos.find(n => n.id == m.id)) {
                    item.videos.push(Object.assign({}, m, VIDEO_ACTION_FEILDS));
                }
            });
        }
       
        return item;
    });
    const store = global.attrs.STORE;
    store.set(STORE_PREFIX + USER_ID, userStore);
}

!(function ipcUser() {
    // 该事件项目页面监听
    // 轮询监听是否文件更新
    ipcMain.on('save-projects', (event, data) => {
        // 轮询监听的项目列表更新
        saveProjects(data.projects);
        // 当项目数发生更新时，触发页面渲染，仅在项目列表页时触发
        event.reply('project-render', '项目有更新');
    });

    ipcMain.on('save-projects-video', (event, data) => {
        // 轮询监听的项目列表更新
        saveProjectsVideos(data);
        
        // 当项目数发生更新时，触发页面渲染，仅在项目列表页时触发
        event.reply('project-video-render', '项目有更新');
    });
})();    
