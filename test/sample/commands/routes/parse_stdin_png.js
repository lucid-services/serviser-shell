'use strict'

const router = require('../router.js');
const Promise = require('bluebird');

const route = router.buildRoute({
    url : 'parse:stdin:png',
    summary: 'redirects png image from stdin to stdout'
});

route.acceptsContentType('image/png');

route.main(function (req, res) {
    req.pipe(res);
});
