var express = require('express');
var robot = require("robotjs");
var app = express();

app.get('/:control/:command/', function (req, res) {
    var control = req.params.control,
        command = req.params.command;
    robot.keyTap(command);
    res.json({comand: `This is ${control}, comand: ${command}`, answer: `ok`});
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});