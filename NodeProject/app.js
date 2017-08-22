var express = require('express'),
	serialComm = require('./modules/serialComm'),
	Config = require('./config/config');

var app = express();
module.exports = require('./config/express')(app, Config);

serialComm.connect();

app.listen(Config.port, function () {
	console.log('Express server listening on port ' + Config.port);
});
