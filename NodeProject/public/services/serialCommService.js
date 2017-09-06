(() =>{
    'use strict';

    //Serial communication Class
    class SerialCommService {
        constructor($http) {
            this.http = $http;
        }

        getAvailablePorts() {
            return this.http({
                url: '/api/serial/getPorts',
                method: 'GET'
            });
        }
        
        connectToPort(portName) {
            return this.http({
                url: '/api/serial/connect',
                method: 'POST',
                data: {
                    comName: portName
                }
            });
        }
    }

    //Angular module
    angular
        .module('app.services')
        .service('serialCommService', SerialCommService);
})();