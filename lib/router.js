'use strict';

const Service = require('serviser');
const _       = require('lodash');

const Route      = require('./route.js');
const jsonParser = require('./middleware/jsonParser.js');
const RouterI    = Service.common.Router;

module.exports = Router;


/**
 * emitted with each {@link Router#buildRoute} method call.
 *
 * @event Router#build-route
 * @property {Route} route
 */

/**
 * @param {Object} options
 * @param {String} [options.routeNameFormat] - will be used to format route UID string. Should contain placeholders: `{method}` & `{name}` `{version}`
 * @param {String} [options.version] - will be part of route path
 * @param {String} options.url - relative endpoint
 *
 * @emits Router#build-route
 * @extends RouterInterface
 * @alias ShellRouter
 * @constructor
 **/
function Router(options) {
    options = options || {};

    if (!options.routeNameFormat || typeof options.routeNameFormat !== 'string') {
        options.routeNameFormat = 'shell_{name}_{version}';
    }

    RouterI.call(this, options);

    this.options.url = this.$normalizeUrl(this.options.url);

    /**
     * Router specific {@link Route} constructor
     * @name Router#Route
     * @instance
     * @type {Function}
     */
    this.Route = function RouterRoute() {
        Route.apply(this, arguments);
    };
    this.Route.prototype = Object.create(Route.prototype, {
        constructor: this.Route
    });
    this.Route.prototype.Router = this;
};

Router.prototype = Object.create(RouterI.prototype);
Router.prototype.constructor = Router;

/**
 * @param {RouteInterface} route
 * @param {String} url
 *
 * @return {Route}
 */
Router.prototype.reflectHttpRoute = function(route, url) {
    if (!(route instanceof Service.Route)) {
        throw new Error('Unsupported `route` object. Must be instanceof http `Route`');
    }

    let _route = this.buildRoute({url: url});

    if (   route.$dataParserMiddleware
        && ~route.$dataParserMiddleware.mediaTypes.indexOf('application/json')
    ) {
        _route.acceptsContentType('text/plain', {}, jsonParser);
    }

    _route.options.summary = route.options.summary;
    _route.options.description = route.options.description;
    _route.options.sdkMethodName = route.options.sdkMethodName;
    _route.description.summary = route.options.summary;
    _route.description.description = route.options.description;
    _route.description.sdkMethodName = route.options.sdkMethodName;

    Object.keys(route.description.responses).forEach(function(statusCode) {
        _route.description.responses[statusCode] =
            _.clone(this.description.responses[statusCode]);
    }, route);

    route.steps.filter(function(step) {
        return ['init', 'noop', 'content-type-parser'].indexOf(step.name) === -1;
    }).forEach(function(step) {
        let _step = _.clone(step);

        if (step.catch instanceof Array) {
            _step.catch = _.clone(step.catch);
        }

        if (step.name === 'validator' && step.args instanceof Array) {
            _step.args = _.cloneDeep(step.args);
        }

        this.steps.push(_step);
    }, _route);

    return _route;
};

/**
 * @example
 * router.$normalizeUrl('endpoint//under/{version}');
 * "/endpoint/unser/v1.0"
 *
 * @param {String} url
 * @private
 * @return {String}
 */
Router.prototype.$normalizeUrl = function(url) {
    if (!url || typeof url !== 'string') {
        return '';
    }

    if (url[0] !== ':') {
        url = ':' + url;
    }

    if (url[url.length - 1] === ':' && url.length > 1) {
        url = url.substring(0, url.length - 1);
    }

    url = url.replace(/{version}/g, this.$getVersionString());
    url = url.replace(/:{2,}/g, ':');

    return url;
};
