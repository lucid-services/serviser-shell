'use strict';

module.exports = ShellApp;

const _       = require('lodash');
const Promise = require('bluebird');
const Service = require('bi-service');

const Response  = require('./response.js');
const Router    = require('./router.js');
const AppStatus = Service.AppStatus;
const AppI      = Service.common.App;

/**
 * @param {AppManager}   appManager
 * @param {Config}       config - module
 * @param {Object}       options
 * @param {String}       options.name - app's name
 * @param {Object}       [options.validator] - Ajv validator initialization options
 * @param {Object|Array} [options.validator.schemas] - list of globally accessible schema definitions
 *
 * @emits ShellApp#status-changed
 * @emits ShellApp#pre-init
 * @emits ShellApp#post-init
 * @emits ShellApp#pre-build
 * @emits ShellApp#post-build
 * @emits ShellApp#build-router
 * @emits ShellApp#listening
 * @emits ShellApp#error
 * @emits ShellApp#unknown-error
 * @emits ShellApp#error-response
 * @extends AppInterface
 * @alias ShellApp
 * @constructor
 **/
function ShellApp(appManager, config, options) {
    const app = this;

    this.middlewares = []; //"global" middleware stack

    /**
     * ShellApp specific Router constructor
     * @name ShellApp#Router
     * @instance
     * @type {Function}
     */
    this.Router = function() {
        Router.apply(this, arguments);
    };
    this.Router.prototype = Object.create(Router.prototype);
    this.Router.prototype.constructor = Router;
    this.Router.prototype.App = this;

    //parent constructor
    AppI.call(this, appManager, config, options);

    //the config will be also inspected prior a shell command is dispatched
    app.service.resourceManager.tag(`config-${app.options.name}`, 'shell');
};

ShellApp.prototype = Object.create(AppI.prototype);
ShellApp.prototype.constructor = ShellApp;

/**
 * @param {Function} [callback]
 * @return {undefined}
 */
ShellApp.prototype.use = function(cb) {
    this.middlewares.push(cb);
};


/**
 * @return {undefined}
 */
ShellApp.prototype.$init = function() {

    this.once('init', function() {
        this.on('error-response', function defaultResponse(err, res) {
            //res.headersSent determines whether a response has been already sent
            //the property name mirrors the property of http res object
            if (!res.headersSent) {
                err = (err.toLogger && err.toLogger()) || err;
                return res.end(JSON.stringify(err, null, 4));
            }
        });

        this.prependListener('error-response', function setStatusCode(err, res) {
            res.status(1);
        });
    });

    return AppI.prototype.$init.call(this);
};

/**
 * overrides abstract method
 * @private
 */
ShellApp.prototype.build = function() {
    let app = this;

    process.nextTick(function() {
        app.emit('pre-build', app);

        app.routers.forEach(function(router) {
            router.routes.forEach(function(route) {
                const cb = route.build();

                app.service.once('shell-cmd', function(yargs) {
                    yargs.command(
                        route.getUrl(),
                        route.options.summary,
                        route.$getYargsParams(),
                        function(argv) {
                            let res = new Response(process.stdout)
                            , req   = process.stdin;

                            req.res = res;
                            res.req = req;
                            req.params = argv;
                            //these data sources are not available thus
                            //for sake of being close to http API data are made
                            //available through multiple properties
                            req.headers = _.clone(req.params);
                            req.query = _.clone(req.params);

                            return Promise.each(app.middlewares, function(fn) {
                                return fn.call(route, req, res) || null;
                            }).then(function() {
                                return cb(req, res);
                            });
                        });
                });
            });
        });
        app.emit('post-build', app);
    });

    return app;
};

/**
 * @return {Object}
 */
ShellApp.prototype.listen = function() {
    if (this.status === AppStatus.ERROR) {
        throw this.statusReason;
    }
    this.server = process.stdin;
    this.$setStatus(AppStatus.OK);
    this.emit('listening', this);

    return this.server;
};

/**
 * @function
 * overwrites inherited method
 */
ShellApp.prototype.close = Promise.method(function() {
    this.server.pause();
});
