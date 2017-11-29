'use strict'

const router = require('../router.js');

const route = router.buildRoute({
    type: 'post',
    url : 'response:filter',
    summary: 'returns strictly typed response',
});

route.respondsWith({
    type: 'object',
    additionalProperties: false,
    properties: {
        username: {type: 'string'},
        email: {type: 'string'}
    }
});

route.main(function (req, res) {
    res.filter({
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        age: 8
    }).json()
});
