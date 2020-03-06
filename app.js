var http = require('http');
var fs = require('fs');
var beagle = require('bonescript');

var loop;
var d;
var startTime = 0;
var voltage = 0;
var v_in = "P9_40";

beagle.pinMode(v_in, beagle.INPUT, 'pulldown', 'fast');

function callADC(){
  beagle.analogRead(v_in, readV);
}

function readV(x){
  console.log('Reading Voltage :' + x.value);
  var value = x.value/557*(4670+557);
  voltage = value;
  console.log('Current Voltage :' + voltage);
}

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, username) {

    console.log('Connected');

    socket.on('start', function () {
      d = new Date();
      startTime = d.getTime();
      console.log(startTime);
      global.loop = setInterval(function(){
          console.log('Current startTime ' + startTime);
          var cd = new Date();
          var currentTime = cd.getTime();
          console.log('Current Time ' + currentTime);
          var time = (currentTime - startTime) / 1000;
          console.log(time);
          callADC();
          var value = voltage;
          data = {'time' : time, 'value': value};
          socket.emit('data', data);
          console.log(data);
        }, 1000);
      console.log('Start!');
    });

    socket.on('stop', function() {
        clearInterval(global.loop);
        console.log('Stop!');
    });

});


server.listen(2020);
