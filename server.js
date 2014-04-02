var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var express = require('express');
var redisClient = require('redis').createClient();
//var comPort = '/dev/cu.usbserial-7413633303335190000';
var comPort = '/dev/tty.usbmodem1421';

var sp = new SerialPort(comPort, {
	baudrate: 38400
  , parser: serialport.parsers.readline("\n")
});

sp.on("data", function (data) {
    console.log("here: "+data);
});

/*

 List the serial ports available
 */
/*
SerialPort.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });
  });
*/


var app = express();

app.get('/', function(req, res){
    res.send('Hello World');
});

app.get('/message', function(req, res){
    res.send('This is my new message');
});

app.listen()