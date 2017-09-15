var express = require('express');
var robot = require("robotjs");
var app = express();

app.get('/control', function (req, res) {
    res.json({
        comand: 'this is control',
        ansver: 'ok'
    });
});

app.get('/volume/mute', function (req, res) {
    robot.keyTap("audio_mute");
    res.json({
        comand: 'mute volume',
        ansver: 'ok'
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
