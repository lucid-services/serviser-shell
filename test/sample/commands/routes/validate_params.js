'use strict'

const router = require('../router.js');

const route = router.buildRoute({
    url : 'validate:args',
    summary: 'validates input arguments',
});

route.validate({
    required: ['email'],
    properties: {
        username: {
            type: ['string', 'null'],
            $desc: 'username'
        },
        email: {
            type: 'string',
            $desc: 'email'
        },
    }
}, 'params');

route.main(function (req, res) {
    res.json(req.params);
});