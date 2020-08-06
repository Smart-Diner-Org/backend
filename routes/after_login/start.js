const express = require("express");
var router = express.Router();
var customerController = require('./../../controllers/after_login/customer.controller');
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var _ = require('underscore');
const { authJwt } = require("../../middlewares");

var cors = require("cors");
var corsOptions;

Restaurant.findAll({
  where: {
    status: true
  },
  attributes: ['url']
})
.then((menus) => {
  var urls =  _.map(menus, function(menu) {
    return menu.url; 
  });
  urls.push(constants.whitelistWebsites[process.env.ENVIRONMENT]);
  corsOptions = {
    origin: function (origin, callback) {
      if (urls.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  };
  //Define all routes here
  router.post('/customer/update_details', [
    // cors(corsOptions), //Will enable before push
    authJwt.verifyToken
    ], customerController.updateCustomerDetails);
})
.catch(err => console.log(err))
;
module.exports = router;
