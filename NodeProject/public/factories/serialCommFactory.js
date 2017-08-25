(() =>{
    'use strict';

    angular
        .module('app.factories')
        .factory('serialCommFactory', ['socketFactory', socketFactory => {
            return () => {
                var socketClient = socketFactory({ ioSocket: io.connect() });

                setInterval(() => {
                    socketClient.emit('foo');
                }, 2000);
            }
        }]);
})();