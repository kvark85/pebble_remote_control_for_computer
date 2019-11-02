const url = 'http://192.168.1.2:3033/';

const xhrRequest = function (url, type, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(this.responseText);
    };
    xhr.open(type, url);
    xhr.send();
};

function sendAjsxCommadnd(data) {
    xhrRequest(`url${data}`, 'GET',
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
                    console.log('Command sent  to Pebble successfully!');
                },
                function () {
                    console.log('Error sending command to Pebble!');
                }
            );
        }
    );
}

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
    function (e) {
        console.log('AppMessage received!');
        sendAjsxCommadnd(e.payload[2881141438]); // Get the initial weather
    }
);
