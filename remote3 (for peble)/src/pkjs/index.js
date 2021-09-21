var DEFAULT_IP = '192.168.1.2';
var DEFAULT_PORT = '3033';

const xhrRequest = function (url, type, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(this.responseText);
    };
    xhr.open(type, url);
    xhr.send();
};

function sendAjsxCommadnd(data) {
    var ip = localStorage.getItem("ipOfControlledComputer") || DEFAULT_IP;
    var port = localStorage.getItem("portOfControlledComputer") || DEFAULT_PORT;
    var url = `http://${ip}:${port}/${data}`;

    console.log(`(JS) Request to ${url}`);
    xhrRequest(url, 'GET',
        function (responseText) {
            const json = JSON.parse(responseText),
                command = json.comand,
                answer = json.answer;

            const dictionary = {
                'COMMAND': command,
                'ANSWER': answer
            };

            // Send to Pebble
            Pebble.sendAppMessage(dictionary,
                function () {
                    console.log('(JS) Command sent  to Pebble successfully!');
                },
                function () {
                    console.log('(JS) Error sending command to Pebble!');
                }
            );
        }
    );
}

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
    function (e) {
        console.log('AppMessage received!');
        sendAjsxCommadnd(e.payload[2881141438]); // Send command to computer
    }
);

Pebble.addEventListener('showConfiguration', function() {
    // Show config page
    var ipOfControlledComputer = localStorage.getItem("ipOfControlledComputer") || '';
    var portOfControlledComputer = localStorage.getItem("portOfControlledComputer") || '';
    console.log(
        '(JS) Show configuration page',
        'ipOfControlledComputer=' + ipOfControlledComputer,
        'portOfControlledComputer=' + portOfControlledComputer
    );
    Pebble.openURL('https://kvark85.github.io/pebble_remote_control_for_computer/' +
        'remote3%20(for%20peble)/configuration-page/configurations.html?version=0.1' +
        '&ipOfControlledComputer=' + encodeURIComponent(ipOfControlledComputer) +
        '&portOfControlledComputer=' + encodeURIComponent(portOfControlledComputer) +
        '&defaultIp=' + encodeURIComponent(DEFAULT_IP) +
        '&defaultPort=' + encodeURIComponent(DEFAULT_PORT));
});

Pebble.addEventListener('webviewclosed', function(e) {
    if (e.response) {
        var configurations = JSON.parse(decodeURIComponent(e.response));
        console.log(
            '(JS) Save configuration',
            'ipOfControlledComputer=' +  configurations.ipOfControlledComputer,
            'portOfControlledComputer=' +  configurations.portOfControlledComputer
        );
        localStorage.setItem("ipOfControlledComputer", configurations.ipOfControlledComputer);
        localStorage.setItem("portOfControlledComputer", configurations.portOfControlledComputer);
    }
    else {
        console.log('(JS) Configuration canceled');
    }
});
