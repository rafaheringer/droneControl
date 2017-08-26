(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', ['$scope', 'droneFactory', function($scope, droneFactory) {

            //Drone instance
            var droneController = droneFactory();

            setInterval(()=>{
                droneController.start();
            }, 2000);
            
        }]);
})();