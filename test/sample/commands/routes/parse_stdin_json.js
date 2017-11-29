'use strict'

const router = require('../router.js');
const Promise = require('bluebird');

const route = router.buildRoute({
    url : 'parse:stdin:json',
    summary: 'parses stdin json input'
});

route.acceptsContentType('text/plain', {}, function(req) {
    return new Promise(function(resolve, reject) {
        let data = '';
        req.resume();
        req.setEncoding('utf8')
        req.on('data', function(chunk) {
            data += chunk;
        });

        req.on('end', function() {
            try {
                data = JSON.parse(data);
            } catch(e) {
                return reject(e);
            }

            req.body = data;
            return resolve();
        });
        req.on('error', reject);
    });
});

route.main(function (req, res) {
    res.json(req.body);
});
