'use strict';
const moduleLoader = require('bi-service').moduleLoader;

const service = require('./index.js');

module.exports = service.appManager;
exports.appManager = service.appManager;

service.buildShellApp('shell', {
    validator: {
        schemas: {
            first_name: {
                type: 'string',
                $desc: 'first_name'
            },
            last_name: {
                type: 'string',
                $desc: 'last_name'
            },
            personal: {
                type: 'object',
                properties: {
                    first_name: {$ref: 'first_name'},
                    last_name: {$ref: 'last_name'},
                }
            }
        }
    }
});

moduleLoader.loadModules([
    __dirname + '/commands',
], {
    except: []
});
