var express = require('express');
var glob = require('glob');
var compress = require('compression');
var methodOverride = require('method-override');

module.exports = function(app, config) {
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use('/nodemodules', express.static(config.root + '/node_modules'));
  app.use(methodOverride());
  
  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  }); 

  return app;
};
