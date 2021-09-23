// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

//const { ipcRenderer } = require('electron')

// We need to wait until the main world is ready to receive the message before
// sending the port. We create this promise in the preload so it's guaranteed
// to register the onload listener before the load event is fired.
// const windowLoaded = new Promise(resolve => {
//   window.onload = resolve
// })
// ipcRenderer.on('main-world-port', async (event) => {
//   await windowLoaded
//   // We use regular window.postMessage to transfer the port from the isolated
//   // world to the main world.
//   window.postMessage('main-world-port', '*', event.ports)
// })
