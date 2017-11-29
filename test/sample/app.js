'use strict';
const moduleLoader = require('bi-service').moduleLoader;

const service = require('./index.js');

module.exports = service.appManager;
exports.appManager = service.appManager;

service.buildShellApp('shell');

moduleLoader.loadModules([
    __dirname + '/commands',
], {
    except: []
});
