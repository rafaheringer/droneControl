(() =>{
    'use strict';

    //Drone class
    class MyoFactory {
        constructor(myoService, $timeout) {
            this.service = myoService;
            this.$timeout = $timeout;

            this.connected = this.service.isConnected();

            this.myMyo;
        }

        start() {
            if(!this.service.isConnected()) {
                this.service.connect();
                this.myMyo = this.service.getConnectedDevice();
                this.connected = this.service.isConnected();
            }
        }

        globalEventRegister(eventName, callback) {
            this.service.on(eventName, callback);
        };

        deviceEventRegister(eventName, callback) {
            this.service.onDevice(eventName, callback);
        }

        disconnect() {
            this.service.disconnect();
            this.connected = this.service.isConnected(); 
            this.myMyo = null;
        }
    }

    //Angular module
    angular
        .module('app.factories')
        .factory('myoFactory', (myoService, $timeout) => new MyoFactory(myoService, $timeout));
})();