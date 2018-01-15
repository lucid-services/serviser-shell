'use strict'

const router = require('../router.js');

const route = router.buildRoute({
    url : 'validate:args',
    summary: 'validates input arguments',
});

route.validate({
    required: ['email'],
    additionalProperties: false,
    properties: {
        username: {
            type: ['string', 'null'],
            $desc: 'username'
        },
        email: {
            type: 'string',
            format: 'email',
            $desc: 'email'
        },
    }
}, 'params');

route.validate('personal', 'params');

route.main(function (req, res) {
    res.json(req.params);
});
