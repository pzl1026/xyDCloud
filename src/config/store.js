// 文件字段（除了基础的视频信息的另外字段，项目/盒子）
const VIDEO_ACTION_FEILDS = {
    isFail: false, //是否下载失败
    isSuccess: false
};

// 项目字段 
const PROJECT_ACTION_FEILDS = {
    isPause: true,
    localPath: '', //所映射的本地文件夹,
    isCreated: false //判断是否被创建到下载任务里面
};

// 设备字段 
const DEVICE_ACTION_FEILDS = {
    isPause: false,
    isCancel: false,
    isDowning: false, //该项目是否正在下载
    isFail: false, //该设备是否因为某个文件下载失败所设置
    localPath: '', //所映射的本地文件夹,
    isLink: false
};

const STORE_PREFIX = 'user_store_';

module.exports = {
    VIDEO_ACTION_FEILDS,
    PROJECT_ACTION_FEILDS,
    DEVICE_ACTION_FEILDS,
    STORE_PREFIX
}


