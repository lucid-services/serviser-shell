const _        = require('lodash');
const service  = require('bi-service');
const App      = require('./lib/app.js');
const Router   = require('./lib/router.js');
const Route    = require('./lib/route.js');
const Response = require('./lib/response.js');

service.AppManager.prototype.buildShellApp = buildShellApp;

function buildShellApp(config, options) {
    return this.$buildApp(App, config, options);
}

/**
 * syntax sugar for building an {@link App} via {@link AppManager#buildShellApp}
 *
 * @public
 * @param {String} name - one of the keys of `apps` service config section
 * @param {Object} [options] - see {@link AppInterface} constructor options
 * @return {App}
 */
service.Service.prototype.buildShellApp = function(name, options) {

    let defaults = {name: name};

    let conf = this.config.getOrFail(`apps:${name}`);
    conf = this.config.createLiteralProvider(conf);
    options = _.assign(defaults, options);

    return this.appManager.buildShellApp(conf, options);
};

module.exports.App      = App;
module.exports.Router   = Router;
module.exports.Route    = Route;
module.exports.Response = Response;
