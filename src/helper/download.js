function downInit () {
    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
        // 设置保存路径,使Electron不提示保存对话框。
        item.setSavePath('D:\\test\\a.mp4')
      
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
            console.log('Download successfully')
          } else {
            console.log(`Download failed: ${state}`)
          }
        })
    });
    
    setTimeout(function () {
        mainWindow.webContents.downloadURL('http://video2.uxinyue.com/Act-ss-mp4-ld/a846ee7b59144f61bfabe8cd2b55f534/95d48f76e4dd86780f3bb1d59600451d-ed0fb0984d6e3148afb17af08574000b.mp4');
    }, 5000)
}

module.exports = {
    downInit
};
