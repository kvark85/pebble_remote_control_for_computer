const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const {serverConfigureAndStart, redefinePort} = require('./services/Server');
const Store = require('./services/Store');
const path = require('path');

const DEFAULT_PORT = 3033;

const iconPath = path.join(__dirname, './public/images/menu_image.png');
let mainWindow;
let tray;
let isServerWorks = false;
const store = new Store({
  configName: 'user-preferences',
  defaults: {port: ''},
});
let configuredPort = store.get('port');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 250,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  mainWindow.loadFile('./windows/mainWindow/index.html');
  // Hide menu buttons (File, Edit, View, Window, Help)
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  // Open the DevTools
  // mainWindow.webContents.openDevTools();
}

function createTray() {
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

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  serverConfigureAndStart(
    `${__dirname}\\public`,
    normalizePortNumber(configuredPort),
    (payload) => {
      isServerWorks = payload === 'server-success-message';
      console.log('(main.js) isServerWorks=', isServerWorks)

      if (isServerWorks === false) {
        mainWindow.show();
      }
    }
  );
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Handler for windows initial data response
ipcMain.on('message-to-main-script', (event, message) => {
  switch (message.type) {
    case 'default-data-request':
      console.log('(main.js) Request to main.js for initial settings.')
      event.sender.send('message-to-main-window', {
        type: 'initial-setting-response',
        payload: {defaultPort: DEFAULT_PORT, configuredPort, isServerWorks},
      });
      break;
    default:
      console.log('(main.js) Request to main.js for redefining the port', message.payload);
      redefinePort(normalizePortNumber(message.payload), (type) => {
        event.sender.send('message-to-main-window', {
          type,
          payload: message.payload,
        });
      });
  }
});

function normalizePortNumber(port) {
  return port === '' ? DEFAULT_PORT : port;
}
