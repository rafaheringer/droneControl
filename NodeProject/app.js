var express = require('express'),
	Config = require('./config/config');

var app = express();
module.exports = require('./config/express')(app, Config);

app.listen(Config.port, function () {
	console.log('Express server listening on port ' + Config.port);
});
