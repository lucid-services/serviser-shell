'use strict';
const config  = require('bi-config');
const Service = require('bi-service').Service;

const service = module.exports = new Service(config);

service.on('set-up', function() {
    require('./app.js');
});

require('bi-service-shell');
