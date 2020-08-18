const express = require("express");
var router = express.Router();
// var customerController = require('./../../controllers/after_login/customer.controller');
// var customerController = require('./../../controllers/after_login/customer.controller');
const { customerController, orderController, paymentsController } = require("./../../controllers/after_login");
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
const { authJwt } = require("../../middlewares");
var helper = require('./../../helpers/general.helper');

var cors = require("cors");
var corsOptions;

Restaurant.findAll({
  where: {
    status: true
  },
  attributes: ['url']
})
.then((restaurants) => {
  var urls = helper.getCorsUrlsList(restaurants);
  corsOptions = helper.getCorsFunction(urls);

  //Define all routes here
  router.post('/customer/update_details', [ cors(corsOptions), authJwt.verifyToken ], customerController.updateCustomerDetails);
  router.get('/customer/fetch_details', [ cors(corsOptions), authJwt.verifyToken ], customerController.fetchCustomerDetails);
  router.post('/order/place_order', [ cors(corsOptions), authJwt.verifyToken ], orderController.placeOrder);
  router.post('/order/cancel', [ cors(corsOptions), authJwt.verifyToken ], orderController.cancelOrder);
  router.post('/payment/create_request', [ cors(corsOptions), authJwt.verifyToken ], paymentsController.createRequest);
  router.post('/payment/webhook', [
    // cors(corsOptions), //Its from instamojo, so we don't need cors middleware check
    // authJwt.verifyToken
    ], paymentsController.paymentWebhook);
})
.catch(err => console.log(err))
;
module.exports = router;
