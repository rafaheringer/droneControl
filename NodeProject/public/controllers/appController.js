(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', 
        ['$scope', 'droneFactory', 'serialCommService', '$timeout',
        ($scope, droneFactory, serialCommService, $timeout) => {
            let controllerData = {
                comPorts: [],
                connectedPort: null
            };

            //Init
            function init() {
                getAvailablePorts();
            }

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
    
                    //Try to connect to the unique port
                    else if(controllerData.comPorts.length == 1) {
                        connectToPort(controllerData.comPorts[0]);
                    }
    
                    else {
    
                    }
                });
            }

            //Connect to port
            function connectToPort(port) {
                serialCommService.connectToPort(port.comName).then(response => {
                    console.log('serialCommService connected to port:', port);
                    controllerData.connectedPort = port;
                });
            }
            
            //Drone instance
            var droneController = droneFactory;

            init();

            angular.extend($scope, {
                getAvailablePorts: getAvailablePorts,
                controllerData: controllerData,
                connectToPort: connectToPort,
                droneController: droneController
            });
            
        }]);
})();