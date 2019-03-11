module.exports = {
    apps: {
        shell: {
            baseUrl: 'http://127.0.0.1',
        },
    },
    logs: {
        exitOnError: true,  // determines whether a process will exit with status code 1 on 'uncaughtException' event
        transports: [
            {
                type: 'console',
                level: 'info',
                priority: 1
            }
        ]
    }
};
