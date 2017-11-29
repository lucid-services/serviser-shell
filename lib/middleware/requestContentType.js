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
    let types        = this.route.$dataParserMiddleware.mediaTypes
    ,   contentTypes = this.route.$dataParserMiddleware.contentTypes;

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
        req.once('data', onData);

        function onData(chunk) {
            req.pause();
            req.unshift(chunk);
            let parser;
            let type = fileType(chunk);

            if (type === null) {
                type = {mime: 'text/plain'};
            }

            parser = contentTypes[type.mime] && contentTypes[type.mime].parser;

            //text/plain can be anything
            if (~types.indexOf('text/plain') || ~types.indexOf(type.mime)) {
                if (parser instanceof Function) {
                    return parser(req).then(resolve).catch(reject);
                }
                return resolve();
            } else {
                return reject(new RequestError(
                    `Unsupported stdin Content-Type: ${type.mime}. Supported: ${types.join('|  ')}`
                ));
            }
        }
    });
}
