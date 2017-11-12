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
                    force: 0
                },
                throttle: {
                    force: 0
                },
                elevator: {
                    force: 0
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

            function setAileronOrientation(force) {
                droneData.aileron.force = force;
                droneFactory.aileron(droneData.aileron.force);
                //$scope.$apply();
            }

            function setThrottle(force) {
                droneData.throttle.force = force;//((100 * force) / (droneData.throttle.maxValue - droneData.throttle.minValue) ) - droneData.throttle.minValue;
                droneFactory.throttle(droneData.throttle.force);
                //$scope.$apply();
            }

            function setElevator(force) {

            }

            //Key listening
            //==============================
            function keyListening(event) {
                //TODO: seamless progress
                let keybind = false;

                switch(event.key) {
                    case 'a':
                        setAileronOrientation(100);
                        keybind = true;
                    break;
                    case 'd':
                        setAileronOrientation(-100);
                        keybind = true;
                    break;
                    case 'ArrowUp':
                        setThrottle(100);
                        keybind = true;
                    break;
                    case 'ArrowDown':
                        setThrottle(1);
                        keybind = true;
                    break;
                }

                if(keybind)
                    event.preventDefault();
            }

            function keyUp(event) {
                switch(event.key) {
                    case 'a':
                        setAileronOrientation(0);
                    break;
                    case 'd':
                        setAileronOrientation(0);
                    break;
                    case 'ArrowUp':
                        setThrottle(50);
                    break;
                    case 'ArrowDown':
                        setThrottle(50);
                    break;
                }
            }

            //MYO Configuration
            //==============================

            //Land and start to fly
            myoFactory.deviceEventRegister('fist', () => {
                console.log('MyoController event: fist');

                if(myoData.listening) {
                    if(droneData.started === true) {
                        droneFactory.land();
                        droneData.started = false;
                    }

                    else {
                        droneFactory.warmUp();
                        droneData.started = true;
                    }
                }
            });

            //Start listening commands
            myoFactory.deviceEventRegister('double_tap', () => {
                console.log('MyoController event: double_tap');
                myoData.listening = !myoData.listening;
                myoFactory.deviceExecute('vibrate', myoData.listening ? 'short' : 'medium');
                $scope.$apply();
            });

            //Listen accelerometer
            myoFactory.deviceEventRegister('accelerometer', (data) => {
                //setThrottle(Math.round(data.z * 100)); //MIN: -100 MAX 100
            });

            //Listen gyroscope
            myoFactory.deviceEventRegister('gyroscope', (data) => {
                //console.log('Myo gyroscope:', data);
            });

            //Listen orientation
            myoFactory.deviceEventRegister('orientation', (data) => {
                //setAileronOrientation(Math.round(data.x * 100)); //MIN: -100 MAX 100
                //setThrottle(Math.round(data.y * 100));
            });

            init();

            angular.extend($scope, {
                getAvailablePorts: getAvailablePorts,
                controllerData: controllerData,
                connectToPort: connectToPort,
                droneController: droneFactory,
                myoController: myoFactory,
                droneData: droneData,
                myoData: myoData,
                keyListening: keyListening,
                keyUp: keyUp
            });
            
        }]);
})();