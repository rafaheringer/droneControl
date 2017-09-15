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

            //MYO Configuration
            //==============================

            //Myo instance
            var myoController = myoFactory;

            myoController.deviceEventRegister('fist', () => {
                console.log('FOOOOOOOOOOOOOOOOOOOOOOOO');
            });

            //Verify acelerometer. When is a positive value, tranform the value to percentage and send UP command.
            //When is a negative value, transform the value to percentage and send DOWN comand.

            init();

            angular.extend($scope, {
                getAvailablePorts: getAvailablePorts,
                controllerData: controllerData,
                connectToPort: connectToPort,
                droneController: droneController,
                myoController: myoController
            });
            
        }]);
})();