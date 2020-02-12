// 文件字段（除了基础的视频信息的另外字段，项目/盒子）
const VIDEO_ACTION_FEILDS = {
    isFail: false, // 是否下载失败
    isSuccess: false,   // 是否成功
    successTime: 0,  // 下载成功时间
    failTime: 0,    //下载失败时间
    failReason: '',     // 失败原因
    downloadProgress: 0, // 下载进度
    localPath: ''
};

// 项目字段 
const PROJECT_ACTION_FEILDS = {
    isPause: true,
    localPath: '', //所映射的本地文件夹,
    isCreated: false //判断是否被创建到下载任务里面
};

// 设备字段 
const DEVICE_ACTION_FEILDS = {
    isPause: false,   //是否取消
    isDelete: false,   //是否删除
    progress: '',       //设备总文件下载进度
    localPath: '', //所映射的本地文件夹,
    fialMsg: '',    //文件下载失败原因
    successTime: '', //设备文件全部下载成功时间
    isSuccess: false,
    isFail: false,
    // downloadCount: 0,   //设备正在下载的文件数
    // downloadSuccessCount: 0 //设备已经成功下载的数量
};

// 设备文件字段
const DEVICE_VIDEO_ACTION_FEILDS = {
    ...VIDEO_ACTION_FEILDS,
    // needDownload: false
}

const STORE_PREFIX = '_user_store_';

module.exports = {
    VIDEO_ACTION_FEILDS,
    PROJECT_ACTION_FEILDS,
    DEVICE_ACTION_FEILDS,
    STORE_PREFIX,
    DEVICE_VIDEO_ACTION_FEILDS
}


