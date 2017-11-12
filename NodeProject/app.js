var express = require('express'),
 	http = require('http'),
	app = express(),
	fs = require('fs'),
	path = require('path'),
	bodyParser = require('body-parser'),
	httpServer = http.createServer(app),
	droneControl = require('./modules/droneControl.js'),
	serialComm = require('./modules/serialComm'),
	socketServer = require('socket.io')(httpServer);

///TODO: Uncople the API server from WEB APP

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Server
//===============================
httpServer.listen('3000', () => {
	console.log('Express server listening on port 3000');
});

//API routes
//===============================
app.route('/api/serial/getPorts').get((req, res, next) => {
    serialComm.getAvailableSerialPorts((error, result) => {
        res.json(result);
    });
});



app.route('/api/serial/connect').post(function(req, res, next) {
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
	fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
	});
});

module.exports = require('./config/express')(app, {
    root: path.normalize(__dirname),
    app: {
      name: 'nodeproject'
    },
    port: 3000,
});

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
				myDrone.goLeft(options.force, options.timeToExecute || null);
			break;
			case 'right':
				myDrone.goRight(options.force, options.timeToExecute || null);
			break;
			// case 'up':
			// 	myDrone.goUp(options.force, options.timeToExecute || null);
			// break;
			// case 'down':
			// 	myDrone.goDown(options.force, options.timeToExecute || null);
			case 'throttle':
				myDrone.setThrottle(options.force, options.timeToExecute || null);
			break;
			break;
			case 'ahead':
				myDrone.goAhead(options.force, options.timeToExecute || null);
			break;
			case 'back':
				myDrone.goBack(options.force, options.timeToExecute || null);
			break;
			case 'warmUp':
				myDrone.levelUp();
			break;
		}
	});

	//Disconnection
	uniqueSocket.on('disconnect', () => {
		console.log('Socket: user disconnected');
	});
});

