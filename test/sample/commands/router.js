const appManager = require('../app.js');

const router = appManager.get('shell').buildRouter({
    version: 1.0,
    url: ':'
});

module.exports = router;
