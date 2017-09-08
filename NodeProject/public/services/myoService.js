let MyoService = (() => {
    'use strict';

    let _connected = false;
    let _myoInstance;
    let _connectedMyo;

    class MyoService {
        constructor($timeout) {
            _myoInstance = Myo;
            _connected = false;
        }

        connect() {
            _myoInstance.connect('com.rafaHeringer.droneControl');
            _connectedMyo = this.listDevices()[0];
            _connected = true;
        }

        disconnect() {
            ///TODO
            _connectedMyo = null;
            _connected = false;
        }

        getConnectedDevice() {
            return _connectedMyo;
        }

        isConnected() {
            return this.connected;
        }

        listDevices() {
            return _myoInstance.myos;
        }

        on(eventName, callback) {
            _myoInstance.on(eventName, callback);
        }

        onDevice(eventName, callback) {
            if(this.connected)
                _connectedMyo.on(eventName, callback);
            else 
                this.on('connected', () => {
                    setTimeout(() => {
                        console.log('myoService deviceEventRegister: event registered - ', eventName);
                        _connectedMyo.on(eventName, callback);
                    }, 100);
                });

            if(_connectedMyo)
                _connectedMyo.on(eventName, callback);
        }
        
    }

    return MyoService;
})();

//Angular module
angular.module('app.services').service('myoService', MyoService);
