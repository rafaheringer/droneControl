var serialPort = require('serialport');
var eventEmitter = require('events').EventEmitter;
var extendObject = require('extend');
var serialPortEventEmitter = new eventEmitter();
var connectedPort = null;

/////////////////////Events
function registerEvent(eventName, callback) {
    eventEmitter.on(eventName, callback);
}
var eventsList = {
    dataSent: {eventName: 'dataSent', line: null},
    connnectionError: {eventName: 'connectionError', error: null},
    sendDataError: {eventName: 'sendDataError', error: null}
};

/////////////////////Connection
function getAvailableSerialPorts() {

};

function connect(serialPortName, serialPortOptions){
    connectedPort = new serialPort(serialPortName, serialPortOptions);
    connectedPort.on('error', function(err) {
        console.error('SerialComm connect: ', err);
        eventEmitter.emit(eventsList.connnectionError.eventName, extendObject({error: err}, eventsList.connnectionError));
    });
};

function disconnect() {};

/////////////////////Data
function sendData(line) {
    if(!line || typeof line != string)
        return console.error('SerialComm sendData: line is must defined and need to be a string.');

    if(connectedPort)
        connectedPort.write(line, function(err){
            if(err) {
                eventEmitter.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));
                return console.error('SerialComm sendData: ', err);
            }

            console.log('SerialComm sendData: ', line);
            eventEmitter.emit(eventsList.dataSent.name, extendObject({line: line}, eventsList.dataSent));
        });

    else {
        eventEmitter.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));
        return console.error('SerialComm sendData: You need to connect to any serial port');
    }
};

/////////////////////Exports
exports.getAvailableSerialPorts = getAvailableSerialPorts;
exports.connect = connect;
exports.disconnect = disconnect;
exports.sendData = sendData;
exports.on = registerEvent;
exports.eventsList = eventsList;