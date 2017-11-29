'use strict'

const router = require('../router.js');

const route = router.buildRoute({
    url : 'response',
    summary: 'returns json response'
});

route.main(function (req, res) {
    res.json({
        username: 'test',
        email: 'test@test.com',
        age: 8
    });
});
