var express = require('express'),
 	http = require('http'),
	config = require('./config/config'),
	app = express(),
	httpServer = http.createServer(app),
	droneControl = require('./modules/droneControl.js'),
	serialComm = require('./modules/serialComm'),
	socketServer = require('socket.io')(httpServer);

///TODO: Uncople the API server from WEB APP
///TODO: Remove Handlebars

//Server
//===============================
httpServer.listen(config.port, () => {
	console.log('Express server listening on port ' + config.port);
});

//API routes
//===============================
app.route('/api/serial/getPorts').get((req, res, next) => {
    serialComm.getAvailableSerialPorts((error, result) => {
        res.json(result);
    });
});

app.route('/api/serial/connect').post((req, res, next) => {
    try {
        serialComm.connect(req.body.comName, {
            baudRate: 115200
        }, (error, result) => {
            res.json(result);
        });
    } catch(ex) {
        res.status(500).json({message: 'Error on connect to the serial port.'});
    }
});

//Web APP routes
//===============================
app.route('/').get((req, res, next) => {
    res.render('index', {
      title: 'MYO Drone Controller'
    });
});

module.exports = require('./config/express')(app, config);

//On connect to socket
//===============================
socketServer.on('connection', uniqueSocket => {
	console.log('Socket: user connected');

	var myDrone = new droneControl.drone(serialComm);

	//Drone commands
	uniqueSocket.on('droneCommand', (options) => {
		console.log('DroneCommand received:', options);


		switch(options.command) {
			case 'turnOff':
				myDrone.turnOff();
			break;
			case 'land':
				myDrone.land();
			break;
			case 'left':
				myDrone.goLeft(options.force);
			break;
			case 'right':
				myDrone.goRight(options.force);
			break;
			case 'up':
				myDrone.goUp(options.force);
			break;
			case 'down':
				myDrone.goDown(options.force);
			break;
			case 'ahead':

			break;
			case 'back':

			break;
			case 'warmUp':
				myDrone.levelUp(100, 1000);
			break;
		}
	});

	//Disconnection
	uniqueSocket.on('disconnect', () => {
		console.log('Socket: user disconnected');
	});
});

