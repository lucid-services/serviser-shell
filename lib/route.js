'use strict';

const _       = require('lodash');
const Service = require('bi-service');

const reqBodyParser = require('./middleware/requestContentType.js');

const utils           = Service.utils;
const RouteType       = Service.RequestType;
const RouteI          = Service.common.Route;
const RouteError      = Service.error.RouteError;
const ServiceError    = Service.error.ServiceError;
const ValidationError = Service.error.ValidationError;

module.exports = Route;

/**
 * @param {Object} options
 * @param {String} [options.name]
 * @param {String} options.type - see {@link RouteType} enum for available option values
 * @param {String} options.url
 * @param {String} options.summary - swagger doc
 * @param {String} options.desc - swagger doc
 *
 * @throws {RouteError}
 * @extends RouteInterface
 * @alias ShellRoute
 * @constructor
 **/
function Route(options) {
    options = options || {};
    const self = this;

    if (   typeof options.type !== 'string'
        || _.keys(RouteType).indexOf(options.type.toUpperCase()) === -1
    ) {
        throw new RouteError('Invalid request type, got: ' + options.type);
    }

    RouteI.call(this, options);

    this.options.type = RouteType[options.type];
    this.options.url = this.Router.$normalizeUrl(options.url);

    this.$setContentTypeParser(reqBodyParser);
    //any route can respond with 500 - Service Error
    this.respondsWith(ServiceError);
};

Route.prototype = Object.create(RouteI.prototype, {
    constructor: Route
});

/**
 * @return {String} - routing key
 */
Route.prototype.getUrl = function getUrl() {
    //we need to normalize the url when Router's url is just '/'
    return this.Router.$normalizeUrl(this.Router.getUrl() + this.options.url);
};

/**
 * @function
 * @return {String} - routing key
 */
Route.prototype.getAbsoluteUrl = Route.prototype.getUrl;

/**
 * returns route's name. If no name has been assigned,
 * the name is dynamically created from route's url path
 *
 * @return {String}
 */
Route.prototype.getName = function() {
    if (this.options.name) {
        return this.options.name;
    }

    var name = ''
    ,   url = this.Router.getUrl() + this.options.url;

    //assign default route uid which we make up from route's endpoint
    url.split(':').forEach(function(segment) {
        var pattern = '^({version}|<.*>|\\[.*\\])$';
        if (!segment.match(pattern)) {
            name += _.upperFirst(segment.toLowerCase());
        }
    });

    return name;
};

/*
 * overrides parent
 */
Route.prototype.validate = function() {
    const args = Array.prototype.slice.call(arguments, 0);
    this.respondsWith(ValidationError);
    return RouteI.prototype.validate.apply(this, args);
};

/**
 * @private
 * @return {Object}
 */
Route.prototype.$getYargsParams = function() {
    let out = {};

    this.steps.filter(function(middleware) {
        return middleware.name === 'validator' && middleware.args[1] === 'params';
    }).forEach(function(middleware) {
        let schema;
        let validator = this.Router.App.getValidator();

        if (typeof middleware.args[0] === 'string') {
            schema = validator.getSchema(middleware.args[0]);
        } else {
            schema = middleware.args[0];
        }
        schema = utils.resolveSchemaRefs(_.cloneDeep(schema));

        Object.assign(out, _ajvSchema2Yargs(schema));
    }, this);

    return out;
};

/**
 * @private
 * @param {String} format
 * @return {String}
 */
Route.prototype.$formatUid = function(format) {
    var type    = this.options.type.toLowerCase();
    var name    = this.getName();
    var version = this.Router.$getVersionString();

    if (format.match(/{version}/g) && !version) {
        throw new RouteError('Can not format route UID, expected url version but got: ' + version);
    }

    format = format.replace(/{method}/g, type);
    format = format.replace(/{Method}/g, _.upperFirst(type));
    format = format.replace(/{name}/g, _.lowerFirst(name));
    format = format.replace(/{Name}/g, _.upperFirst(name));
    format = format.replace(/{version}/g, version);

    return format;
};

/**
 * @private
 * @param {Object} schema
 * @return {Object}
 */
function _ajvSchema2Yargs(schema) {
    let out = {};
    if (_.isPlainObject(schema)
        && schema.type === 'object'
        && _.isPlainObject(schema.properties)
    ) {
        Object.keys(schema.properties).forEach(function(key) {
            let prop = schema.properties[key];
            if (_.isPlainObject(prop)) {
                let type = prop.type;
                let array = false;
                let required = true;

                if (type instanceof Array) {
                    type = type.filter(function(type) {
                        if (type === 'null') {
                            required = false;
                        }
                        return type !== 'null';
                    });

                    if (type.length !== 1) {
                        type = 'string';
                    }
                } else if(type === 'integer') {
                    type = 'number';
                } else if(type === 'object') {
                    throw new Error('Invalid property type `object`. Complex data structures are not supported');
                } else if(type === 'array') {
                    array = true;
                    type = 'string';
                    if (_.isPlainObject(prop.items)) {
                        type = prop.items.type;
                    }
                }

                out[key] = {
                    describe: prop.$desc || '',
                    required: required,
                    array: array,
                    type: type
                };
            }
        });
    }

    return out;
}
