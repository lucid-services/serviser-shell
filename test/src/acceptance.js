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
                    input : stdin || undefined
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

    it.skip('should return json response according to defined schema', function() {
        const result = this.spawn([':response:filter']);

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql({
            username: 'test',
            email: 'test@test.com',
            age: 8
        });
    });

    it('should respond with parsed json from stdin', function() {
        const data = {
            prop1: 'value',
            prop2: 'value2',
            prop3: null,
            prop4: 1,
        };

        const result = this.spawn(
            [':parse:stdin:json'],
            JSON.stringify(data)
        );

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql(data);
    });

    it('should redirect stdin to stdout', function() {
        const image = fs.readFileSync(path.resolve(__dirname + '/../test.png'));
        const result = this.spawn(
            [':parse:stdin:png'],
            image
        );

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        result.stdout.toString('hex').should.be.equal(image.toString('hex'));
    });
});
