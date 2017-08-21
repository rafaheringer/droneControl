var Express = require('express'),
	Myo = require("Myo"),
	Config = require('./config/config');

var app = Express();

module.exports = require('./config/express')(app, Config);
Myo.connect('com.rafaheringer.droneControl', require('ws'));

Myo.on('fist', function(){
	console.log('Hello Myo!');
	this.vibrate();
});

Myo.on('connected', function(){
	console.log('connected!', this.id)
  });

app.listen(Config.port, function () {
	console.log('Express server listening on port ' + Config.port);
});
