(() =>{
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', ['$scope', 'serialCommFactory', function($scope, serialCommFactory) {
            var comm = serialCommFactory();
        }]);
})();