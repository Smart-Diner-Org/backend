const express = require("express");
var router = express.Router();
var restaurantController = require('./../../controllers/before_login/restaurant.controller');
const { orderController } = require("./../../controllers/after_login");
var Restaurant = require('./../../models/Restaurant');
// var constants = require('./../../config/constants');
// var _ = require('underscore');
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
    // app.get('/:id', function(req, res){
  router.get('/restaurant/get_full_details', cors(corsOptions), restaurantController.getRestaurantDetails);
  router.get('/order/:id/status', cors(corsOptions), orderController.getOrderStatus);
  router.post('/restaurant/save_contact_request', cors(corsOptions), restaurantController.saveContactRequest);
  router.post('/restaurant/save_subscription', cors(corsOptions), restaurantController.saveSubscription);
})
.catch(err => console.log(err));
module.exports = router;
