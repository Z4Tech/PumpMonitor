var http = require('http');
var fs = require('fs');
var beagle = require('bonescript');

var loop;
var d;
var startTime = 0;
var voltage = 0;

function callADC(){
  beagle.analogRead(P9_40, readV);
}

function readV(x){
  var value = x.value/547*4670;
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


server.listen(8080);