(() =>{
    'use strict';

    //Drone class
    class Drone {
        constructor(serialCommFactory) {
            this.serialComm = serialCommFactory;
        }

        throttle(force) {
            this.serialComm.send('droneCommand',{command: 'throttle', force: force});
        }

        aileron(force) {
            this.serialComm.send('droneCommand',{command: 'aileron', force: force});
        }

        elevator(force) {
            this.serialComm.send('droneCommand',{command: 'elevator', force: force});
        }

        turnOff(force) {
            this.serialComm.send('droneCommand',{command: 'turnOff'});
        }
    }

    //Angular module
    angular
        .module('app.factories')
        .factory('droneFactory', (serialCommFactory) => new Drone(serialCommFactory));
})();