var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	console.log('API is working properly & checking again...');
    res.send('API is working properly & checking again...');
});
router.get('/api2', function(req, res, next) {
    res.send('API 2 response 1 + 2 = 3');
});

module.exports = router;