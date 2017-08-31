(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', ['$scope', 'droneFactory', ($scope, droneFactory) => {

            //Drone instance
            var droneController = droneFactory;

            setInterval(()=>{
                droneController.warmUp();
            }, 2000);
            
        }]);
})();