const express = require('express');
const robot = require('robotjs');

const expressApp = express();
let expressServer;

function startServer(port, handler) {
  expressServer = expressApp.listen(
    port,
    () => {
      console.log(`(Server.js) Server started. Port: ${port}`);
      handler('server-success-message');
    }
  ).on('error', () => {
    console.log(`(Server.js) Port ${port} is busy. Please chose another port.`);
    handler('server-error-message');
  });
}

function serverConfigureAndStart(assetsPath, port, handler) {
  expressApp.use(express.static(assetsPath));

  expressApp.get('/:control/:command/', function ({params: {control, command}}, res) {
    robot.keyTap(command);

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.json({
      control: `This is ${control}`,
      command: `${command}`,
      answer: 'ok',
    });
  });

  startServer(port, handler);
}

const redefinePort = (port, handler) => {
  const newPort = (port !== undefined && port !== '') ? port : DEFAULT_PORT;

  console.log(`(Server.js) redefinePort port. Port will be = ${newPort}`);

  if (expressServer) {
    console.log('(Server.js) Server exist (already have been created)');
    expressServer.close && expressServer
      .close(
        () => {
          console.log('(Server.js) Previous server was successfully closed.');
          startServer(newPort, handler);
        }
      );
    return;
  }
  console.log('(Server.js) There is no worked server before');
  startServer(newPort, handler);
};

module.exports.serverConfigureAndStart = serverConfigureAndStart;
module.exports.redefinePort = redefinePort;
