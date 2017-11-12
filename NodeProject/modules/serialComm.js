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

registerEvent(eventsList.sendDataError.name, ob => ob.error ? console.error('SerialComm sendData error: ', ob.error) : null);
registerEvent(eventsList.connectionError.name, ob => ob.error ? console.error('SerialComm connection error: ', ob.error) : null);
registerEvent(eventsList.receiveData.name, ob => ob.line ? console.log('SerialComm receivedData:', ob.line) : null);

/////////////////////Connection
function getAvailableSerialPorts(callback) {
    return serialPort.list(callback);
};

function connect(serialPortName, serialPortOptions, callback){
    connectedPort = new serialPort(serialPortName, serialPortOptions, callback);

    console.log('SerialComm connect: connected');

    connectedPort.on('error', err => err ? eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: err}, eventsList.connectionError)):null);
    connectedPort.on('data', line => line ? eventHandler.emit(eventsList.receiveData.name, extendObject({line: line}, eventsList.receiveData)):null);

    return connectedPort;
};

function disconnect() {
    if(connectedPort)
        return connectedPort.close(err => {
            if(err)
                return eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: err}, eventsList.connectionError));

            connectedPort = null;
            console.log('SerialComm disconnect: connection closed');
        });
    else
        return eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: 'You need to connect to any port first'}, eventsList.connectionError));
    
};

/////////////////////Data
function sendData(line) {
    line += '\n';
    console.log('SerialComm sending data:', line);

    if((!line || typeof line != 'string'))
        return eventHandler.emit(eventsList.sendDataError.eventName, extendObject({error: '"line" is must defined and need to be a string.'}, eventsList.sendDataError));

    if(connectedPort)
        return connectedPort.write(line, err => {
            if(typeof err != undefined) 
                return eventHandler.emit(eventsList.sendDataError.eventName, extendObject({error: err}, eventsList.sendDataError));

            //console.log('SerialComm sentData: ', line);
            eventHandler.emit(eventsList.dataSent.eventName, extendObject({line: line}, eventsList.dataSent));
        });

    else 
        return eventHandler.emit(eventsList.connectionError.eventName, extendObject({error: 'You need to connect to any port first'}, eventsList.connectionError));
};

/////////////////////Exports
exports.getAvailableSerialPorts = getAvailableSerialPorts;
exports.connect = connect;
exports.disconnect = disconnect;
exports.sendData = sendData;
exports.on = registerEvent;
exports.eventsList = eventsList;