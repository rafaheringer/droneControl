(() =>{
    'use strict';

    //Custom modules
    angular.module('app.directives', []);
    angular.module('app.services', []);
    angular.module('app.factories', []);
    angular.module('app.providers', []);
    angular.module('app.filters', []);

    //Main app
    angular.module('droneControlApp', [
         //Custom modules 
          'app.directives'
        , 'app.services'
        , 'app.factories'
        , 'app.providers'
        , 'app.filters'

        //Third party
        , 'btford.socket-io'
    ])
})();