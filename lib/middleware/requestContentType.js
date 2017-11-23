const _        = require('lodash');
const service  = require('bi-service');
const Promise  = require('bluebird');
const fileType = require('file-type');

const RequestError = service.error.RequestError;

/**
 * {Route} middleware which validates Content-Type header and parses the request
 * body
 */
module.exports = function requestContentTypeParserMiddleware(req, res) {
    let types        = self.route.$dataParserMiddleware.mediaTypes
    ,   contentTypes = self.route.$dataParserMiddleware.contentTypes;

    return parse(types, contentTypes, req);
};

/*
 * @private
 * body parser promise wrapper
 * @param {Array<String>} types - supported mime types
 * @param {Object} contentTypes - mimeType => parserFn
 * @param {Stdin}  req
 * @return Promise
 */
function parse(types, contentTypes, req) {
    return new Promise(function(resolve, reject) {
        req.resume();
        req.once('data', function(chunk) {
            req.pause();
            let parser;
            let type = fileType(chunk);

            if (type === null) {
                type = {mime: 'text/plain'};
            }

            parser = contentTypes[type.mime];

            if (~types.indexOf(type.mime)) {
                if (parser instanceof Function) {
                    return parser(req).then(resolve).catch(reject);
                }
                return resolve();
            } else {
                return reject(new RequestError(
                    `Unsupported Content-Type: ${type}. Supported: ${types.join('|  ')}`
                ));
            }
        });
    });
}
