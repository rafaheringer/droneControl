(() =>{
    'use strict';

    //Drone class
    class Drone {
        constructor(serialCommFactory) {
            this.serialComm = serialCommFactory;
        }

        warmUp() {
            this.serialComm.send('droneCommand', {command: 'warmUp'});
        }
    }

    //Angular module
    angular
        .module('app.factories')
        .factory('droneFactory', (serialCommFactory) => new Drone(serialCommFactory));
})();