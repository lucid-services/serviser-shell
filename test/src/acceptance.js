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

    it('should return json response according to defined schema', function() {
        const result = this.spawn([':response:filter']);

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql({
            username: 'test',
            email: 'test@test.com',
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

    it('should respond with error formated as valid json when stdin is not valid json', function() {
        const result = this.spawn(
            [':parse:stdin:json'],
            'invalid json input'
        );

        result.status.should.be.equal(1);
        JSON.parse(result.stdout.toString()).should.be.eql({
            api_code: null,
            code: 500,
            message: 'Internal Server Error',
            context: {
                message: 'Unexpected token i in JSON at position 0'
            }
        });
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

    it('should respond with error formated as valid json when stdin is not valid png image', function() {
        const result = this.spawn(
            [':parse:stdin:png'],
            'invalid stdin input'
        );

        result.status.should.be.equal(1);
        JSON.parse(result.stdout.toString()).should.be.eql({
            api_code: null,
            uid: null,
            code: 400,
            message: 'Unsupported stdin Content-Type: text/plain. Supported: image/png',
        });
    });

    it('should respond with parsed shell command arguments', function() {
        const data = {
            username: 'test',
            email: 'test@test.com'
        };

        const result = this.spawn(
            [
                ':validate:args',
                '--username',
                data.username,
                '--email',
                data.email
            ]
        );

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        JSON.parse(result.stdout.toString()).should.be.eql(data);
    });

    it('should respond with json error response when invalid email argument value is provided', function() {
        const data = {
            username: 'test',
            email: 'test'
        };

        const result = this.spawn(
            [
                ':validate:args',
                '--username',
                data.username,
                '--email',
                data.email
            ]
        );

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(1);
        JSON.parse(result.stdout.toString()).should.be.eql({
            api_code: null,
            uid: null,
            code: 400,
            message: '.email should match format "email"',
        });
    });

    it('should print available command parameters', function() {

        const result = this.spawn(
            [
                ':validate:args',
                '--help',
            ]
        );

        result.stderr.toString().should.be.equal('');
        result.status.should.be.equal(0);
        result.stdout.toString().should.be.equal(
            'node_modules/.bin/bi-service :validate:args\n' +
            '\n' +
            'Options:\n' +
            '  --help, -h    Show help  [boolean]\n' +
            '  --config      Custom config file destination  [string]\n' +
            '  --version     Prints bi-service version  [boolean]\n' +
            '  --username    username\n' +
            '  --email       email  [string] [required]\n' +
            '  --first_name  first_name  [string]\n' +
            '  --last_name   last_name  [string]\n' +
            '\n'
        );
    });
});
