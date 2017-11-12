(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', 
        ['$scope', 'droneFactory', 'serialCommService', '$timeout', 'myoFactory',
        ($scope, droneFactory, serialCommService, $timeout, myoFactory) => {
            let controllerData = {
                comPorts: [],
                connectedPort: null
            };

            let myoData = {
                listening: false
            };

            let droneData = {
                started: false,
                aileron: {
                    value: 0,
                    minValue: -0.50,
                    maxValue: 0.50,
                    force: 0
                },
                throttle: {
                    value: 0,
                    minValue: -50,
                    maxValue: 50,
                    force: 50
                }
            };

            //Init
            function init() {
                getAvailablePorts();
            }

            //Serial Communication
            //==============================
            //Get available ports
            function getAvailablePorts() {
                serialCommService.getAvailablePorts().then(response => {
                    controllerData.comPorts = response.data;
    
                    console.log('serialCommService available ports:', controllerData.comPorts);
    
                    //If dont get any available ports
                    if(controllerData.comPorts.length == 0) {
                        console.warn('serialCommService getAvailablePorts: ports not found. Retrying...');
                        $timeout(getAvailablePorts, 1000);
                    }
    
                    //Try to connect to Arduino
                    else {
                        var found = false;
                        angular.forEach(controllerData.comPorts, (port)=> {
                            if(!found && port.manufacturer.toLowerCase().indexOf('arduino') != -1)
                                connectToPort(port);
                        });
                    }
    
                });
            }

            //Connect to port
            function connectToPort(port) {
                serialCommService.connectToPort(port.comName).then(response => {
                    console.log('serialCommService connected to port:', port);
                    controllerData.connectedPort = port;
                }, () => {
                    console.error('serialCommService connectToPort: port connection error.');
                });
            }
            
            //Drone control
            //==============================
            //Drone instance
            var droneController = droneFactory;

            function setAileronOrientation(value) {
                droneData.aileron.value = value;
                droneData.aileron.force = value;
                //console.log(value,droneData.aileron.force);
                $scope.$apply();

                if(droneData.aileron.force <= 0) {
                    droneController.goRight(droneData.aileron.force * -1);
                } else {
                    droneController.goLeft(droneData.aileron.force);
                }
            }

            function setThrottle(value) {
                droneData.throttle.value = value;
                droneData.throttle.force = ((100 * value) / (droneData.throttle.maxValue - droneData.throttle.minValue) ) - droneData.throttle.minValue;
                $scope.$apply();

                // if(droneData.throttle.force <= 50) {
                //     droneController.goDown(50 - droneData.throttle.force);
                // } else {
                //     droneController.goUp(droneData.throttle.force - 50);
                // }

            }


            //MYO Configuration
            //==============================

            //Myo instance
            var myoController = myoFactory;

            //Land and start to fly
            myoController.deviceEventRegister('fist', () => {
                console.log('MyoController event: fist');

                if(myoData.listening) {
                    if(droneData.started === true) {
                        droneController.land();
                        droneData.started = false;
                    }

                    else {
                        droneController.warmUp();
                        droneData.started = true;
                    }
                }
            });

            //Start listening commands
            myoController.deviceEventRegister('double_tap', () => {
                console.log('MyoController event: double_tap');
                myoData.listening = !myoData.listening;
                myoController.deviceExecute('vibrate', myoData.listening ? 'short' : 'medium');
                $scope.$apply();
            });


            //Listen accelerometer
            myoController.deviceEventRegister('accelerometer', (data) => {
                //setThrottle(Math.round(data.z * 100)); //MIN: -100 MAX 100
            });

            //Listen gyroscope
            myoController.deviceEventRegister('gyroscope', (data) => {
                //console.log('Myo gyroscope:', data);
            });

            //Listen orientation
            myoController.deviceEventRegister('orientation', (data) => {
                //setAileronOrientation(Math.round(data.x * 100)); //MIN: -100 MAX 100
                //setThrottle(Math.round(data.y * 100));
            });

            init();

            angular.extend($scope, {
                getAvailablePorts: getAvailablePorts,
                controllerData: controllerData,
                connectToPort: connectToPort,
                droneController: droneController,
                myoController: myoController,
                droneData: droneData,
                myoData: myoData
            });
            
        }]);
})();