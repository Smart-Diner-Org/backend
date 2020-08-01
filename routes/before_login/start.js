const express = require("express");
var router = express.Router();
var restaurantController = require('./../../controllers/before_login/restaurant_controller');
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var _ = require('underscore');


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
  console.log(urls);
  corsOptions = {
    origin: function (origin, callback) {
      console.log(urls);
      if (urls.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  };
  //Define all routes here
  router.get('/restaurant/get_full_details', cors(corsOptions), restaurantController.getRestaurantDetails);
})
.catch(err => console.log(err))
;
// router.get('/menu/get', cors(corsOptions), restaurantController.getMenu);
module.exports = router;
