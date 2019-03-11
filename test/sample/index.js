'use strict';
const config  = require('serviser-config');
const Service = require('serviser').Service;

const service = module.exports = new Service(config);

service.on('set-up', function() {
    require('./app.js');
});

require('serviser-shell');
