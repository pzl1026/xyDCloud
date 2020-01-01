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
        console.log(STORE_PREFIX + info.login_id, 'STORE_PREFIX + info.id1')
        store.set(STORE_PREFIX + info.login_id, userStore);
    } else {
        console.log(STORE_PREFIX + info.login_id, 'STORE_PREFIX + info.id2')
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
