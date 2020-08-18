const express = require("express");
var router = express.Router();
var restaurantController = require('./../../controllers/before_login/restaurant_controller');
const { orderController } = require("./../../controllers/after_login");
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var _ = require('underscore');
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
  // var urls =  _.map(restaurants, function(menu) {
  //   return menu.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
  //   // return menu.url; 
  // });
  var urls = helper.getCorsUrlsList(restaurants);
  // urls.push(constants.whitelistWebsites[process.env.ENVIRONMENT]);
  // corsOptions = {
  //   origin: function (origin, callback) {
  //     console.log("urls");
  //     console.log(urls);
  //     console.log("origin");
  //     console.log(origin);
  //     var ori = origin.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
  //     if (urls.indexOf(ori) !== -1) {
  //       callback(null, true)
  //     } else {
  //       callback(new Error('Not allowed by CORS'))
  //     }
  //   }
  // };
  corsOptions = helper.getCorsFunction(urls);
  //Define all routes here
    // app.get('/:id', function(req, res){
  router.get('/restaurant/get_full_details', cors(corsOptions), restaurantController.getRestaurantDetails);
  router.get('/order/:id/status', cors(corsOptions), orderController.getOrderStatus);
  // router.get('/order/:id/status', orderController.getOrderStatus);
})
.catch(err => console.log(err));
module.exports = router;
