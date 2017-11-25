(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', 
        ['$scope', 'droneFactory', 'serialCommService', '$timeout', 'myoFactory', '$interval',
        ($scope, droneFactory, serialCommService, $timeout, myoFactory, $interval) => {
            let controllerData = {
                comPorts: [],
                connectedPort: null
            };

            let myoData = {
                listening: false
            };

            let droneData = {
                started: false,
                speedLimit: 80,
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
                droneData.aileron.force = force > droneData.speedLimit ? droneData.speedLimit : force < -droneData.speedLimit ? -droneData.speedLimit : force;
                droneFactory.aileron(droneData.aileron.force);
                //$scope.$apply();
            }

            function setThrottle(force) {
                droneData.throttle.force = force;// > droneData.speedLimit ? droneData.speedLimit : force < 100 - droneData.speedLimit ? 100 - droneData.speedLimit : force;
                droneFactory.throttle(droneData.throttle.force);
                //$scope.$apply();
            }

            function setElevator(force) {
                droneData.elevator.force = force > droneData.speedLimit ? droneData.speedLimit : force < -droneData.speedLimit ? -droneData.speedLimit : force;
                droneFactory.elevator(droneData.elevator.force);
            }

            //Key listening
            //==============================
            let keys = {
                a: {
                    value: 0,
                    minValue: -100,
                    defaultValue: 0,
                    intervalFn: null,
                    triggerFn: setAileronOrientation
                },
                d: {
                    value: 0,
                    maxValue: 100,
                    defaultValue: 0,
                    intervalFn: null,
                    triggerFn: setAileronOrientation
                },
                w: {
                    value: 0,
                    maxValue: 100,
                    defaultValue: 0,
                    intervalFn: null,
                    triggerFn: setElevator
                },
                s: {
                    value: 0,
                    minValue: -100,
                    defaultValue: 0,
                    intervalFn: null,
                    triggerFn: setElevator
                },
                ArrowUp: {
                    value: 50,
                    maxValue: 100,
                    defaultValue: 50,
                    intervalFn: null,
                    triggerFn: setThrottle
                },
                ArrowDown: {
                    value: 50,
                    minValue: 1,
                    defaultValue: 50,
                    intervalFn: null,
                    triggerFn: setThrottle
                }
                
            };

            function smoothIncrease(keyPressed) {
                keyPressed.intervalFn = $interval(()=>{
                    let step = 10;

                    if((keyPressed.maxValue && keyPressed.value < keyPressed.maxValue) || (keyPressed.minValue && keyPressed.value > keyPressed.minValue)) {

                        if(keyPressed.maxValue)
                            keyPressed.value = keyPressed.value >= keyPressed.maxValue ? keyPressed.value : keyPressed.value + step;
                        else
                            keyPressed.value = keyPressed.value <= keyPressed.minValue ? keyPressed.value : keyPressed.value - step;
                            
                        keyPressed.triggerFn(keyPressed.value);
                        console.log(keyPressed.value);
                    }
                }, 60);
            }

            function keyListening(event) {
                const keyPressed = keys[event.key];

                if(keyPressed) {
                    event.preventDefault();
                    
                    if(!keyPressed.intervalFn) 
                        smoothIncrease(keyPressed);
                }
            }

            function keyUp(event) {
                const keyPressed = keys[event.key];

                if(keyPressed) {
                    $interval.cancel(keyPressed.intervalFn);
                    keyPressed.intervalFn = null;
                    keyPressed.value = keyPressed.defaultValue;
                    keyPressed.triggerFn(keyPressed.value);
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