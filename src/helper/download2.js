
var path = require('path');
var fs = require('fs');
const request = require('request');

// ---- 下载类 ---- //
function StreamDownload() {
  // 声明下载过程回调函数
  this.downloadCallback = null;
}

// 下载进度
StreamDownload.prototype.showProgress = function (received, total) {
  const percentage = (received * 100) / total;
  // 用回调显示到界面上
  this.downloadCallback('progress', percentage);
};

// 下载过程
StreamDownload.prototype.downloadFile = function (
  patchUrl, 
  baseDir, 
  filename, 
  callback = () => {}, 
  errorBack = () => {}
) {

  this.downloadCallback = callback; // 注册回调函数
  this.downloadErrorCallback = errorBack;

  const downloadFile = filename; // 下载文件名称，也可以从外部传进来

  let receivedBytes = 0;
  let totalBytes = 0;

  const req = request({
    method: 'GET',
    uri: patchUrl
  });

  const out = fs.createWriteStream(path.join(baseDir, downloadFile));
  req.pipe(out);

  req.on('response', (data) => {
    if (data.statusCode != 200) {
      this.downloadErrorCallback(data, '404:该文件不存在');
      return;
    }
    // 更新总文件字节大小
    totalBytes = parseInt(data.headers['content-length'], 10);
  });

  req.on('data', (chunk) => {
    // 更新下载的文件块字节大小
    receivedBytes += chunk.length;
    this.showProgress(receivedBytes, totalBytes);
  });

  req.on('end', () => {
    console.log('下载已完成，等待处理');
    // TODO: 检查文件，部署文件，删除文件
    this.downloadCallback('finished');
  });
};


module.exports = StreamDownload;

// const StreamDownload2 = new StreamDownload();

// // export default StreamDownload2;

// // 定义回调函数
// function downloadFileCallback(arg, percentage)
// {
//     if (arg === "progress")
//     {
//         console.log(percentage, 'percentage');
//         // 显示进度
//     }
//     else if (arg === "finished")
//     {
//         // 通知完成
//         console.log('下载成功')
//     }
// }

// // 调用下载
// StreamDownload2.downloadFile("http://video2.uxinyue.com/Act-ss-mp4-ld/fbb1d9501c2d4969b60c765dfc02b60f/f9fef56e6f2b4434f7cfc1ae83eca029-a3588ec80a643019802ef1a0dbeefa6f.mp4", "", 'a.mp4', downloadFileCallback)