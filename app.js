
/**
 * Module dependencies.
 */
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
//var redisClient = require('redis').createClient();
var exec = require('child_process').exec;
var messages = require('./scripts/text').messages;
var fortunes = require('./scripts/text').fortunes;

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
    res.render('index', { title: 'Save Bubbles' });
});
app.get('/message', function(req, res){
    res.json({message: messages[Math.round(Math.random() * (messages.length - 1))]});
});

var appServer = http.createServer(app);
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
 */

var io = require('socket.io').listen(appServer);
appServer.listen(app.get('port'));


io.sockets.on('connection', function (socket) {
    socket.log.info('socket connection');
});

/**
 *
 *  Serial port communication
 *
 */
var comPort = '/dev/tty.usbmodem1421';

var sp = new SerialPort(comPort, {
  baudrate: 38400
  , parser: serialport.parsers.readline("\n")
});

var currentlySaying = false;
sp.on("data", function (data) {
    var d = new Date();
    console.log(d.toLocaleString() + " serialData: "+data);
    if (data == 1) {
        if (!currentlySaying) {
            currentlySaying = true;
            var fortune = fortunes[Math.round(Math.random() * (fortunes.length - 1))];
            var cmd = 'say -v Bubbles ' + fortune;
            console.log('running:' + cmd);
            exec(
                cmd
              , function (error, stdout, stderr) {
                    currentlySaying = false;
                }
            );
            io.sockets.emit('fortune', {fortune: fortune});
        }
    }
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