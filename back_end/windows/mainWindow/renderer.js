const ipcRenderer = require('electron').ipcRenderer;

let defaultPort;
const portInput = document.getElementById('portInput');
const applyButton = document.getElementById('applyButton');
const infoBlock = document.getElementById('info');

function showErrorMessageAboutPort(port) {
  alert(`Port ${port} is busy. Please chose another port.`);
}

function toggleInfoBlock(value) {
  infoBlock.style.display = value === '' ? 'block' : 'none'
}

applyButton.addEventListener('click', () => {
  ipcRenderer.send('message-to-main-script', {
    type: 'redefinePort',
    payload: portInput.value
  });

  toggleInfoBlock(portInput.value);
});

ipcRenderer.on('message-to-main-window', (event, message) => {
  switch (message.type) {
    case 'initial-setting-response':
      setInitialValues(message.payload)
      break;
    case 'server-error-message':
      showErrorMessageAboutPort(message.payload)
      break;
    default:
      const port = message.payload === '' ? defaultPort : message.payload;
      alert(`Port changed successfully. New port for remote control: ${port}`)
  }
});

function setInitialValues(message) {
  defaultPort = message.defaultPort;

  document.getElementById('default-port').textContent = defaultPort;
  portInput.value = message.configuredPort;
  toggleInfoBlock(message.configuredPort);
  if (message.isServerWorks === false) {
    const portForMessage = message.configuredPort === '' ? defaultPort : message.configuredPort;
    showErrorMessageAboutPort(portForMessage);
  }
}

ipcRenderer.send('message-to-main-script', {type: 'default-data-request'});
