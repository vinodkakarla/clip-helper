var app = require('app')
var BrowserWindow = require('browser-window')
const globalShortcut = require('global-shortcut');

// var gui = require('nw.gui');
// var win = gui.Window.get();

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
  // console.log("App getting started..1");
  // console.log('file://' + __dirname + '/index.html');

  mainWindow.setAlwaysOnTop(true);
  // console.log('file://' + __dirname + '/index.html');
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  // console.log("App getting started..2");
  mainWindow.on('blur', function() {
    // console.log('I do not want to be closed');
    mainWindow.blurWebView();
    mainWindow.hide();
    //mainWindow.close();
  });
  //mainWindow.openDevTools();
  // console.log(globalShortcut);
  globalShortcut.unregister('ctrl+e');
  // Register Global shortcut
  // console.log('registering');
  var ret = globalShortcut.register('ctrl+e', function() {
    mainWindow.show();
    mainWindow.focus();
    // win.show();
    // win.focus();
    console.log('ctrl+e is pressed');
  });
  if (!ret) {
    console.log('Keyboard shortcut registration failed');
  }
  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('ctrl+e'));
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
  console.log(globalShortcut.isRegistered('ctrl+e') + " *** ");
  globalShortcut.unregister('ctrl+e');
  globalShortcut.unregisterAll();
  app.quit();
});
