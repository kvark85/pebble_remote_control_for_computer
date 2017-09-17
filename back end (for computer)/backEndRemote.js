var express = require('express');
var robot = require("robotjs");
var app = express();

app.get('/control/:command/', function (req, res) {
    var command = req.params.command;
    //console.log(`Comand is ${command}`);
    robot.keyTap(command);
    res.json({comand: `this is ${command}`,answer: `ok`});
});

app.get('/volume/:command', function (req, res) {
    var command = req.params.command;
    //console.log(`Comand is ${command}`);
	robot.keyTap(command);
	res.json({comand: `this is ${command}`,answer: `ok`});
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});