(() =>{
    'use strict';

    angular
        .module('app.factories')
        .factory('droneFactory', ['serialCommFactory', serialCommFactory => {

            //Drone class
            class Drone {
                constructor(serialCommInstance) {
                    console.log(serialCommInstance);
                    this.serialComm = serialCommInstance;
                    this.foo = 'bar';
                }

                warmUp() {
                    //this.serialComm.send('droneCommand', {command: 'warmUp'});
                    console.log(this);
                }
            }

            return Drone;

            return () => {
                var myDrone = new Drone(serialCommFactory());

                return {
                    start: myDrone.warmUp
                }
            };
        }]);
})();