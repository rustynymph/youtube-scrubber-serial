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
      open_sockets.forEach(function(socket){
        socket.emit("port", {'name':port.comName});
      })
      console.log(port.comName);
      //console.log(port.pnpId);
      //console.log(port.manufacturer);
    });
  });
  socket.on('getportinfo', function(msg){
    SerialPort.list(function (err, ports) {
      ports.forEach(function(port) {
        open_sockets.forEach(function(socket){
          socket.emit("port", {'name':port.comName});
        })
      });
    });
});
socket.on('portselected', function(msg){
  var port = new SerialPort(msg["name"].toString(), {
    baudRate: 115200,
    encoding: 'utf8'
  });
  
  port.on('open', function() {
        console.log("port opened");
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
        parser.on('data', function(data){
          var message = parseData(data);
          socket.emit("video", message);
        });       
    });

});
  socket.on('disconnect', function(){
        //remove this socket from our list of open sockets
        open_sockets = open_sockets.filter(function(item){
              return item != socket;
        });
  });
});

http.listen(WS_PORT, function(){
  console.log('listening for WEBSOCKET connections on *:'+WS_PORT);
});

function parseData(data){
  //console.log(data);
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
