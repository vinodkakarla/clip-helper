var electron = require('electron');
var jetpack = require('fs-jetpack');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

console.log(require.resolve('electron'));
// var gui = require('nw.gui');
// var win = gui.Window.get();

var homeDirectory = process.env.HOME || process.env.USERPROFILE;
//return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
var filePath = homeDirectory + "/.clipManager";
var shortcutKey = 'e';
var acceptedKeys = "e|g|k|l|j"
if (jetpack.exists(filePath)) {
  var valueSet = jetpack.read(filePath, 'json');
  var key = valueSet.shortcutKey;
  if (key && key.length == 1 && key.match(acceptedKeys)) {
    shortcutKey = key;
  }
}


app.on('ready', function() {
  console.log("App getting started..");
  var mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    transparent: true,
    // alwaysontop: false,
    frame: false,
    // kiosk: false
  })
  console.log("App getting started..1");
  // console.log('file://' + __dirname + '/index.html');

  //mainWindow.setAlwaysOnTop(true);
  console.log('file://' + __dirname + '/index.html');
  // console.log('file://' + __dirname + '/index.html');
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  console.log("App getting started..2");
  mainWindow.on('blur', function() {
    // console.log('I do not want to be closed');
    mainWindow.blurWebView();
    //mainWindow.hide();
    //mainWindow.close();
  });
  mainWindow.openDevTools();
  // console.log(globalShortcut);
  globalShortcut.unregister('ctrl+' + shortcutKey);
  // Register Global shortcut
  console.log('registering');
  var ret = globalShortcut.register('ctrl+' + shortcutKey, function() {
    mainWindow.show();
    mainWindow.focus();
    // win.show();
    // win.focus();
    console.log('ctrl+' + shortcutKey + ' is pressed');
  });
  if (!ret) {
    console.log('Keyboard shortcut registration failed');
  }
  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('ctrl+' + shortcutKey));
})

// app.on('browser-window-blur', function() {
//   console.log('I do not want to be closed1');
//
// })

// app.on('app-command', function(e, cmd) {
//   // Navigate the window back when the user hits their mouse back button
//   if (cmd === 'browser-backward' && app.webContents.canGoBack()) {
//     app.webContents.goBack();
//   }
//   console.log(cmd);
//   console.log(e);
//   console.log(app.webContents.canGoBack());
// })

app.on("window-all-closed", function() {
  console.log(globalShortcut.isRegistered('ctrl+' + shortcutKey) + " *** ");
  globalShortcut.unregister('ctrl+' + shortcutKey);
  globalShortcut.unregisterAll();
  app.quit();
});
