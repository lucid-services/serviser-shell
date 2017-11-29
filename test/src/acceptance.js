const fs           = require('fs-extra');
const path         = require('path');
const chai         = require('chai');
const childProcess = require('child_process');
const tmp          = require('tmp');

chai.should();

describe('CLI', function() {

    before(function() {
        const sampleAppPath = path.resolve(__dirname + '/../sample');
        const self = this;
        tmp.setGracefulCleanup();
        this.tmpDir = tmp.dirSync({unsafeCleanup: true});
        this.spawn = spawn;

        return fs.copy(sampleAppPath, this.tmpDir.name).then(function() {
            return self.runNpmInstall(self.tmpDir.name);
        });

        function spawn(args, stdin) {
            return childProcess.spawnSync(
                `./node_modules/.bin/bi-service`,
                args,
                {
                    cwd: self.tmpDir.name,
                    stdio : stdin || undefined
                }
            )
        }
    });

    after(function() {
        this.tmpDir.removeCallback();
    });

    it('should return valid json response', function() {
        const result = this.spawn([':response']);

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql({
            username: 'test',
            email: 'test@test.com',
            age: 8
        });
    });

    it('should return json response according to defined schema', function() {
        const result = this.spawn([':response:filter']);

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql({
            username: 'test',
            email: 'test@test.com',
            age: 8
        });
    });
});
