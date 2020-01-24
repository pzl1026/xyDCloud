const {STORE_PREFIX} = require('../config/store');
const store = global.attrs.STORE;

/**
 * 保存用户信息
 */
function storeUser(info) {
    let userStore = getUser(info);
    // 判断是否已存在
    if (userStore) {
        for (let k in info) {
            userStore[k] = info[k];
        }
        store.set(STORE_PREFIX + info.login_id, userStore);
    } else {
        store.set(STORE_PREFIX + info.login_id, info);
    }
}

/**
 * 获取用户信息
 */
function getUser(info) {
    return store.get(STORE_PREFIX + info.login_id);
}

function getUserById(userId) {
    return store.get(STORE_PREFIX + userId);
}


/**
* 微信登陆
*/
function handleWxLogin () {

}

module.exports = {
    storeUser, 
    handleWxLogin,
    getUser,
    getUserById
}
