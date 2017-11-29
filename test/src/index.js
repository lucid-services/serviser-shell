const Promise      = require('bluebird');
const childProcess = require('child_process');

before(function() {
    this.runNpmInstall = runNpmInstall;
});

function runNpmInstall(projectRoot) {

    const npmArgs = [ 'install' ];
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const proc = childProcess.spawn(npmCmd, npmArgs, {cwd: projectRoot});

    return new Promise(function(resolve, reject) {
        let stderr = '';
        proc.stderr.on('data', function(data) {
            stderr += data.toString();
        });
        proc.on('close', function(code) {
            if (code !== 0) {
                return reject(new Error(stderr));
            }

            return resolve();
        });
    });
}
