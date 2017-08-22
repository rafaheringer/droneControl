var serialPort = require('serialport');

var connect = function(){
    console.log('Foo');
};

var disconnect = function(){};

var sendData = function(line){};

exports.connect = connect;
exports.disconnect = disconnect;
exports.sendData = sendData;