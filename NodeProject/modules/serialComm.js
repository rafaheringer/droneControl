var serialPort = require('serialport');
var eventEmitter = require('events').EventEmitter;
var extendObject = require('extend');
var serialPortEventEmitter = new eventEmitter();
var connectedPort = null;

/////////////////////Events
var eventHandler = new eventEmitter();

function registerEvent(eventName, callback) {
    eventHandler.on(eventName, callback);
}

let eventsList = {
    dataSent: {eventName: 'dataSent', line: null},
    connnectionError: {eventName: 'connectionError', error: null},
    sendDataError: {eventName: 'sendDataError', error: null}
};

registerEvent(eventsList.sendDataError.name, ob => {console.error('SerialComm sendData: ', ob.error);});

/////////////////////Connection
function getAvailableSerialPorts() {

};

function connect(serialPortName, serialPortOptions){
    connectedPort = new serialPort(serialPortName, serialPortOptions);
    connectedPort.on('error', err => {
        console.error('SerialComm connect: ', err);
        eventEmitter.emit(eventsList.connnectionError.eventName, extendObject({error: err}, eventsList.connnectionError));
    });
};

function disconnect() {};

/////////////////////Data
function sendData(line) {
    if(!line || typeof line != string)
        return eventEmitter.emit(eventsList.sendDataError.eventName, extendObject({error: '"line" is must defined and need to be a string.'}, eventsList.sendDataError));

    if(connectedPort)
        connectedPort.write(line, err => {
            if(err) 
                return eventEmitter.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));

            console.log('SerialComm sendData: ', line);
            eventEmitter.emit(eventsList.dataSent.name, extendObject({line: line}, eventsList.dataSent));
        });

    else 
        return eventEmitter.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));
};

/////////////////////Exports
exports.getAvailableSerialPorts = getAvailableSerialPorts;
exports.connect = connect;
exports.disconnect = disconnect;
exports.sendData = sendData;
exports.on = registerEvent;
exports.eventsList = eventsList;