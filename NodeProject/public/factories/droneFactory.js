(() =>{
    'use strict';

    //Drone class
    class Drone {
        constructor(serialCommFactory) {
            this.serialComm = serialCommFactory;
        }

        goUp(force) {
            this.serialComm.send('droneCommand',{command: 'up', force: force});
        }

        goLeft(force) {
            this.serialComm.send('droneCommand',{command: 'left', force: force});
        }

        goAhead(force) {
            this.serialComm.send('droneCommand',{command: 'ahead', force: force});
        }

        goBack(force) {
            this.serialComm.send('droneCommand',{command: 'back', force: force});
        }

        goRight(force) {
            this.serialComm.send('droneCommand',{command: 'right', force: force});
        }

        goDown(force) {
            this.serialComm.send('droneCommand',{command: 'down', force: force});
        }

        warmUp() {
            this.serialComm.send('droneCommand', {command: 'warmUp'});
        }

        land() {
            this.serialComm.send('droneCommand', {command: 'land'});
        }


    }

    //Angular module
    angular
        .module('app.factories')
        .factory('droneFactory', (serialCommFactory) => new Drone(serialCommFactory));
})();