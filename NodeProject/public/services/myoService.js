(() =>{
    'use strict';

    //Serial communication Class
    //////////////////PAREI AQUIII> Problema de escopo na função onDevice. Colocar os métodos privados como privados.
    class MyoService {
        constructor($timeout) {
            this.myo = Myo;
            this.$timeout = $timeout;

            this.connected = false;
            this.connectedMyo;
        }

        connect() {
            this.myo.connect('com.rafaHeringer.droneControl');
            this.connectedMyo = this.listDevices()[0];
            this.connected = true;
        }

        disconnect() {
            ///TODO
            this.connectedMyo = null;
            this.connected = false;
        }

        getConnectedDevice() {
            return this.connectedMyo;
        }

        isConnected() {
            return this.connected;
        }

        listDevices() {
            return this.myo.myos;
        }

        on(eventName, callback) {
            this.myo.on(eventName, callback);
        }

        onDevice(eventName, callback) {
            if(this.connected)
                this.connectedMyo.on(eventName, callback);
            else 
                this.on('connected', () => {
                    this.$timeout(() => {
                        console.log('myoService deviceEventRegister: event registered - ', eventName);
                        this.connectedMyo.on(eventName, callback);
                    }, 100);
                });

            if(this.connectedMyo)
                this.connectedMyo.on(eventName, callback);
        }
       
    }

    //Angular module
    angular
        .module('app.services')
        .service('myoService', MyoService);
})();