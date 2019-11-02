const express = require('express');
const robot = require("robotjs");
const app = express();

const PORT = 3033;

app.use(express.static(`${__dirname}/public`));

app.get('/:control/:command/', function ({ params: { control, command } }, res) {
    robot.keyTap(command);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({
        control: `This is ${control}`,
        command: `${command}`,
        answer: 'ok',
    });
});

app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}!`);
});