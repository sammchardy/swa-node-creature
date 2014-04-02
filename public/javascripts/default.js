var messageTimeout = 5000;
var messageField = null;
var fortuneField = null;

Zepto(function($){

	messageField = $('#message');
	fortuneField = $('#fortune');
	fetchMessage();

	var socket = io.connect('http://localhost');
	socket.on('fortune', function (data) {
		console.log(data);
		fortuneField.html(data.fortune);
	});
});

function fetchMessage() {
	$.getJSON('/message', function(data) {
		messageField.html(data.message);
		setTimeout(function() { fetchMessage(); }, messageTimeout);
	});
}