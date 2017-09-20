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

            //Avoid connecting state
            setTimeout(() => {
                _myoInstance.setLockingPolicy('none');
            }, 100);
        }

        disconnect() {
            _myoInstance.off('connected');
            _myoInstance.off();
            _myoInstance.disconnect();
            _connectedMyo = null;
            _connected = false;
        }

        getConnectedDevice() {
            return _connectedMyo;
        }

        isConnected() {
            return _connected;
        }

        listDevices() {
            return _myoInstance.myos;
        }

        on(eventName, callback) {
            _myoInstance.on(eventName, callback);
        }

        onDevice(eventName, callback) {
            if(_connectedMyo) {
                _myoInstance.on(eventName, callback);
                console.log('myoService deviceEventRegister: event registered - ', eventName);
            }

            else {
                _myoInstance.on('connected', () => {
                    setTimeout(() => {
                        _myoInstance.on(eventName, callback);
                        console.log('myoService deviceEventRegister: event registered - ', eventName);
                    }, 100);
                });
            }
        }
        
    }

    return MyoService;
})();

//Angular module
angular.module('app.services').service('myoService', MyoService);
