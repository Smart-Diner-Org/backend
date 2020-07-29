const express = require("express");
var router = express.Router();
var db = require('./../../database/config');
var Menu = require('./../../models/Menu');

// var indexRouter = require('./index');
// var usersRouter = require('./users');
// var authenticateController = require('../controllers/authenticate-controller');
// var registerController = require('../controllers/register-controller');

router.get('/menu/get', (req, res, next) =>
    Menu.findAll()
    .then(menus => {
    	console.log(menus);
    	res.json({
            status: true,
            message:'successfully fetched menus',
            menus : menus
        });
    	// res.sendStatus(200);
    })
    .catch(err => console.log(err))
);

module.exports = router;