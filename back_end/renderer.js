// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const remote = require('electron').remote;
const main = remote.require('./main.js');

const portInput = document.getElementById('portInput');
const applyButton = document.getElementById('applyButton');

applyButton.addEventListener('click', () => {
    localStorage.setItem("port", portInput.value);
    setInfoBlock(portInput.value);
    defineServerPort(portInput.value, () => {
        alert('Configuration saved.')
    });
});

document.addEventListener("DOMContentLoaded", function() {
    portInput.value = localStorage.getItem("port");
    setInfoBlock(portInput.value);
    defineServerPort(portInput.value);
});

const setInfoBlock = (inputValue) => {
    let infoText = inputValue === '' ? `(default port ${main.DEFAULT_PORT})` : '';

    document.getElementById("info").innerHTML = infoText;
};

const defineServerPort = (port, handler) => {
    main.definePort(port === '' ? main.DEFAULT_PORT : port, handler)
};
