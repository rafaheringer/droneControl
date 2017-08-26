(() =>{
    'use strict';

    angular
        .module('app.factories')
        .factory('serialCommFactory', ['socketFactory', socketFactory => {
            return () => {
                var socketClient = socketFactory({ ioSocket: io.connect() });

                function send(message) {
                    socketClient.emit(message);
                }

                return {
                    send: send
                }

            }
        }]);
})();