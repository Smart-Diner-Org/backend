const express = require("express");
var router = express.Router();
// var customerController = require('./../../controllers/after_login/customer.controller');
// var customerController = require('./../../controllers/after_login/customer.controller');
const { customerController, orderController, paymentsController, restaurantController } = require("./../../controllers/after_login");
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
const { authJwt, verificationsToPlaceOrder } = require("../../middlewares");
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
  // corsOptions='*';

  //Define all routes here
  router.post('/customer/update_details', [ cors(corsOptions), authJwt.verifyToken ], customerController.updateCustomerDetails);
  router.get('/customer/fetch_details', [ cors(corsOptions), authJwt.verifyToken ], customerController.fetchCustomerDetails);
  router.post('/order/place_order', [
    cors(corsOptions), 
    authJwt.verifyToken,
    verificationsToPlaceOrder.checkCustomer,
    verificationsToPlaceOrder.checkRestaurantBranch,
    verificationsToPlaceOrder.checkOrderStage,
    verificationsToPlaceOrder.checkPaymentStatus,
    verificationsToPlaceOrder.checkModeOfDelivery,
    verificationsToPlaceOrder.checkPaymentType
  ], orderController.placeOrder);

  router.post('/order/place_offline_order', [
    cors(corsOptions), 
    authJwt.verifyToken,
    verificationsToPlaceOrder.checkMobileNumber,
    verificationsToPlaceOrder.checkCustomerAddress,
    verificationsToPlaceOrder.checkPaymentType,
    verificationsToPlaceOrder.checkRestaurantBranch,
    verificationsToPlaceOrder.checkOrderStage,
    verificationsToPlaceOrder.checkPaymentStatus,
    verificationsToPlaceOrder.checkModeOfDelivery
  ], orderController.placeOfflineOrder);

  router.post('/order/:orderId/cancel', [ cors(corsOptions), authJwt.verifyToken ], orderController.cancelOrder);
  router.post('/order/:orderId/update_status', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], orderController.updateOrderStage);
  router.post('/payment/create_request', [ cors(corsOptions), authJwt.verifyToken ], paymentsController.createRequest);
  router.post('/payment/webhook', [
    // cors(corsOptions), //Its from instamojo, so we don't need cors middleware check
    ], paymentsController.paymentWebhook);
  router.get('/restaurant/get_details', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], restaurantController.getDetails);
  router.get('/restaurant/:branchId/get_orders', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], restaurantController.getOrdersForBranch);
  router.get('/restaurant/:branchId/get_menu', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], restaurantController.getMenuForBranch);
  // router.get('/restaurant/get_cities', [ cors(corsOptions), authJwt.verifyToken ], restaurantController.getCities);
  // router.get('/restaurant/get_states', [ cors(corsOptions), authJwt.verifyToken ], restaurantController.getStates);
  router.get('/order/:orderId/get_menu_quantity_measure_price_details', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], restaurantController.getMenuQuantityMeasurePriceDetailsForOrder);
  router.get('/restaurants/all', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessAllRestaurants ], restaurantController.getAllRestaurants);
})
.catch(err => console.log(err))
;
module.exports = router;
