var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var authenticateController=require('../controllers/authenticate-controller');
var registerController=require('../controllers/register-controller');

/* route to handle login and registration */
router.post('/api/register',registerController.register);
router.post('/api/login',authenticateController.authenticate);

module.exports = router;
