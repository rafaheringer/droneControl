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
    connectionError: {eventName: 'connectionError', error: null},
    sendDataError: {eventName: 'sendDataError', error: null},
    receiveData: {eventName: 'receiveData', line: null}
};

registerEvent(eventsList.sendDataError.name, ob => {console.error('SerialComm sendData: ', ob.error);});
registerEvent(eventsList.connectionError.name, ob => {console.error('SerialComm connection: ', ob.error);});

/////////////////////Connection
function getAvailableSerialPorts() {

};

function connect(serialPortName, serialPortOptions){
    connectedPort = new serialPort(serialPortName, serialPortOptions);
    connectedPort.on('error', err => {
        eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: err}, eventsList.connectionError));
    });

    connectedPort.on('data', line => {
         eventHandler.emit(eventsList.receiveData.name, extendObject({line: line}, eventsList.receiveData));
    });
};

function disconnect() {
    if(connectedPort)
        connectedPort.close(err => {
            if(err)
                return eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: err}, eventsList.connectionError));

            connectedPort = null;
            console.log('SerialComm disconnect: connection closed');
        });
    else
        eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: 'You need to connect to any port first'}, eventsList.connectionError));
    
};

/////////////////////Data
function sendData(line) {
    if(!line || typeof line != string)
        return eventHandler.emit(eventsList.sendDataError.eventName, extendObject({error: '"line" is must defined and need to be a string.'}, eventsList.sendDataError));

    if(connectedPort)
        connectedPort.write(line, err => {
            if(err) 
                return eventHandler.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));

            console.log('SerialComm sendData: ', line);
            eventHandler.emit(eventsList.dataSent.name, extendObject({line: line}, eventsList.dataSent));
        });

    else 
        return eventHandler.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));
};

/////////////////////Exports
exports.getAvailableSerialPorts = getAvailableSerialPorts;
exports.connect = connect;
exports.disconnect = disconnect;
exports.sendData = sendData;
exports.on = registerEvent;
exports.eventsList = eventsList;