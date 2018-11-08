var WS_PORT=8000

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SerialPort = require('serialport');
var Readline = require('@serialport/parser-readline')
var util = require("util"), repl = require("repl");

var open_sockets = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/player.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log('a user connected');
  open_sockets.push(socket);

  SerialPort.list(function (err, ports) { 
    ports.forEach(function(port) {
      console.log("Device");
      console.log("======");
      var name = port.comName;
      var pnpId = port.pnpId;
      var manufacturer = port.manufacturer;
      console.log(name);
      console.log(pnpId);
      console.log(manufacturer);

      if(manufacturer == 'ARM' || name.includes("ACM") || name.includes("usbmodem")){
        var port = new SerialPort(name, {
          baudRate: 115200,
          encoding: 'utf8'
        });
        
        port.on('open', function() {
              console.log("port opened: " + name);
              const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
              parser.on('data', function(data){
                var message = parseData(data);
                socket.emit("video", message);
              });       
          });
      }

    });
  });

  socket.on('disconnect', function(){
        open_sockets = open_sockets.filter(function(item){
              return item != socket;
        });
  });
});

http.listen(WS_PORT, function(){
  console.log('listening for WEBSOCKET connections on *:'+WS_PORT);
});

function parseData(data){
  var message = {};
  if (data.includes(":")) {
    var params = data.split(":");
    var key = params[0].replace(/\n/g,'').replace(/\s/g,'');
    var value = params[1].replace(/\n/g,'').replace(/\s/g,'');
    message = {'key': key, 'value': [value]};
    console.log(message);
    return message;
  }
  var key = data.replace(/\n/g,'').replace(/\s/g,'');
  message = {'key': key.toString(), 'value': ["0"]};
  console.log(message);
  return message;
}
