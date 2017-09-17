var url = 'http://simplenotes.ddns.net:3000/';

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function sendAjsxCommadnd(data) {
  xhrRequest(url + data, 'GET', 
    function(responseText) {
      var json = JSON.parse(responseText),
          command = json.comand,
          answer = json.answer;
      
      var dictionary = {
        'COMMAND': command,
        'ANSWER': answer
      };
      
      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {console.log('Command sent  to Pebble successfully!');},
        function(e) {console.log('Error sending command to Pebble!');}
      );
    }      
  );
}

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    sendAjsxCommadnd(e.payload[2881141438]); // Get the initial weather
  }                     
);
