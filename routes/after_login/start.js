const express = require("express");
var router = express.Router();
// var customerController = require('./../../controllers/after_login/customer.controller');
// var customerController = require('./../../controllers/after_login/customer.controller');
const { customerController, orderController } = require("./../../controllers/after_login");
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
    cors(corsOptions), //Will enable before push
    authJwt.verifyToken
    ], customerController.updateCustomerDetails);
  router.post('/customer/fetch_details', [
    cors(corsOptions), //Will enable before push
    authJwt.verifyToken
    ], customerController.fetchCustomerDetails);
  router.post('/order/place_order', [
    // cors(corsOptions), //Will enable before push
    authJwt.verifyToken
    ], orderController.placeOrder);
})
.catch(err => console.log(err))
;
module.exports = router;
