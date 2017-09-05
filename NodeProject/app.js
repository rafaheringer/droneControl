var express = require('express'),
 	http = require('http'),
	config = require('./config/config'),
	app = express(),
	httpServer = http.createServer(app),
	droneControl = require('./modules/droneControl.js'),
	serialComm = require('./modules/serialComm'),
	socketServer = require('socket.io')(httpServer);

module.exports = require('./config/express')(app, config);

httpServer.listen(config.port, () => {
	console.log('Express server listening on port ' + config.port);
});

//On connect to socket
socketServer.on('connection', uniqueSocket => {
	console.log('Socket: user connected');

	var myDrone = new droneControl.drone(serialComm);

	//Drone commands
	uniqueSocket.on('droneCommand', (options) => {
		console.log('DroneCommand received:', options);


		switch(options.command) {
			case 'warmUp':
				myDrone.connect();
				myDrone.levelUp(100);
			break;
		}
	});

	//Disconnection
	uniqueSocket.on('disconnect', () => {
		console.log('Socket: user disconnected');
	});
});

