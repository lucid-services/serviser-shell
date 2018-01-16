const json5   = require('json5');
const Promise = require('bluebird');

module.exports = function(req, res) {
    return new Promise(function(resolve, reject) {

        let data = '';
        req.once('error', reject);

        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            data += chunk;
        });

        req.once('end', function() {
            try {
                req.body = json5.parse(data.trim());
                return resolve(null);
            } catch(e) {
                return reject(e);
            }
        });
        req.resume();
    });
};
