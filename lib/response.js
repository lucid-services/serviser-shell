module.exports = Response;
module.exports.Response = Response;

/**
 * @param {WritableStream} stdout
 * @alias ShellResponse
 * @constructor
 */
function Response(stdout) {
    this.req = null; //reference to the request object
    this.statusCode = null;
    this.headersSent = false;
    this.stdout = stdout;


    for (method in process.stdout){
        if (process.stdout[method] instanceof Function
            && ['write', 'status', 'json', 'end'].indexOf(method) === -1
        ) {
            this[method] = function() {
                return this.stdout[method].apply(this.stdout, arguments);
            };
        }
    }
}

/**
 * @return {boolean}
 */
Response.prototype.write = function(chunk, encoding) {
    this.headersSent = true;
    return this.stdout.write(chunk, encoding);
};

/**
 * @param {Integer} status
 * @return {Response} - self
 */
Response.prototype.status = function(status) {
    this.statusCode = status;
    process.exitCode = status;
    return this;
};

/**
 * @param {mixed} data
 * @return {boolean}
 */
Response.prototype.json = function(data) {
    this.write(JSON.stringify(data));
    return this.end();
};

/**
 * @param {mixed} data
 * @return {boolean}
 */
Response.prototype.end = function(data) {
    if (typeof data !== 'undefined') {
        this.write(data);
    }
    return process.exit();
};
