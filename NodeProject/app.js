var express = require('express'),
 	http = require('http'),
	config = require('./config/config'),
	app = express(),
	httpServer = http.createServer(app),
	socketServer = require('socket.io')(httpServer);

module.exports = require('./config/express')(app, config);

httpServer.listen(config.port, () => {
	console.log('Express server listening on port ' + config.port);
});

//On connect to socket
socketServer.on('connection', uniqueSocket => {
	console.log('Socket: user connected');

	//
	uniqueSocket.on('foo', () => {
		console.log('OOOOOOOOOOOOOOOOOi');
	});

	//Disconnection
	uniqueSocket.on('disconnect', () => {
		console.log('Socket: user disconnected');
	});
});

