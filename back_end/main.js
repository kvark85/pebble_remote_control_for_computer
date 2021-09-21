// Modules to control application life and create native browser window
const electron = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const path = require('path')
const express = require('express');
const robot = require("robotjs");
const expressApp = express();
const iconPath = path.join(__dirname, '/images/menu_image.png');

const DEFAULT_PORT = 3033;
let expressServer;
let mainWindow;
let tray;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500 ,
    height: 250,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('minimize',function(event){
    console.log('Minimize');
    event.preventDefault();
    mainWindow.hide();
  });

  // Open the DevTools
  // mainWindow.webContents.openDevTools()
}

function createTray () {
  let template = [
    {
      label: 'Show configuration',
      click: () => mainWindow.show(),
    },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ];
  const ctxMenu = Menu.buildFromTemplate(template);

  tray = new Tray(iconPath);
  tray.setContextMenu(ctxMenu);
  tray.setToolTip('Radio control configuration');
}

// This method will be called when Electron has finished initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Express configuration START
  expressApp.use(express.static(`${__dirname}/public`));
  console.log('Path to static files: ', express.static(`${__dirname}/public`));

  expressApp.get('/:control/:command/', function ({ params: { control, command } }, res) {
    robot.keyTap(command);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({
      control: `This is ${control}`,
      command: `${command}`,
      answer: 'ok',
    });
  });

  // Express configuration END
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

const startServer = (newPort) => {
  expressServer = expressApp.listen(newPort, () => {
    console.log(`New server created, listening on port ${newPort}!`);
  });
}

const definePort = (port, handler) => {
  const newPort = (port !== undefined && port !== '') ? port : DEFAULT_PORT;

  console.log(`Define port. Port will be = ${newPort}`);

  if(expressServer) {
    console.log('Server exist (already have been created)');
    expressServer.close && expressServer.close(() => {
      console.log('Previous server was successfully closed');
      startServer(newPort);
      if (handler) {
        handler();
      }
    });
    return;
  }
  console.log('There is no worked server');
  startServer(newPort);
  if (handler) {
    handler();
  }
}

exports.definePort = definePort;
exports.DEFAULT_PORT = DEFAULT_PORT;
