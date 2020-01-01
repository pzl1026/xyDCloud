// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path');
const download = require('./src/helper/download');
// require('electron-debug')({ showDevTools: true })
const ipcInit = require('./src/ipc');
// require('electron-reload')(__dirname); //引入
const client = require('electron-connect').client;

// 

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.mainWindow = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('./index.html')
  mainWindow.loadURL("http://localhost:8001");

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  client.create(mainWindow);
  require('./src/global')();
  ipcInit();

  // download.downInit(mainWindow);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
