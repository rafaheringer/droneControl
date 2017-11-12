(() =>{
    'use strict';

    //Serial communication Class
    class SerialComm {
        constructor(socketFactory) {
            this.socketClient = socketFactory({ ioSocket: io.connect() });
        }

        send(message, command) {
            //console.log('Socket sent:', message, command);
            this.socketClient.emit(message, command);
        }
    }

    //Angular module
    angular
        .module('app.factories')
        .factory('serialCommFactory', (socketFactory) => new SerialComm(socketFactory));
})();