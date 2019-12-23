// 文件字段（除了基础的视频信息的另外字段，项目/盒子）
const VIDEO_ACTION_FEILDS = {
    isPause: false, //是否暂停
    isCancel: false,    //是否取消
    isDownFail: false, //是否下载失败
    isExist: false  //文件是否存在
};

// 项目字段 
const PROJECT_ACTION_FEILDS = {
    isPause: false,
    isCancel: false,
    isDowning: false, //该项目是否正在下载
    isFail: false, //该项目是否因为某个文件下载失败所设置]
    localPath: '' //所映射的本地文件夹
};

// 设备字段 
const DEVICE_ACTION_FEILDS = {
    isPause: false,
    isCancel: false,
    isDowning: false, //该项目是否正在下载
    isFail: false, //该设备是否因为某个文件下载失败所设置
    localPath: '' //所映射的本地文件夹,
    isLink: false
};


