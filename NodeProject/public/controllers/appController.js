(function () {
    'use strict';

    angular
        .module('droneControlApp')
        .controller('mainAppController', ['$scope', function($scope){
            $scope.foo = 'bar';
        }]);
})();