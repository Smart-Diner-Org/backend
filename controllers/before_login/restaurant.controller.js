var Menu = require('./../../models/Menu');
var MenuCategory = require('./../../models/MenuCategory');
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var RestaurantDetail = require('./../../models/RestaurantDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var _ = require('underscore');
const { URL } = require('url');
var ContactRequest = require('./../../models/ContactRequest');
var RestaurantEmployee = require('./../../models/RestaurantEmployee');

module.exports.getMenu = (req, res) => {
  Menu.findAll({
    include:[
      { model: MenuCategory, required: true, as: 'category' }
    ]
  })
  .then(menus => {
    res.json({
          status: true,
          message:'successfully fetched menus',
          menus : menus
      });
    // res.sendStatus(200);
  })
  .catch(err => console.log(err))
  ;
}

module.exports.getDetails = (req, res) => {
  RestaurantEmployee.findOne({
      where: {
        status: true,
        customer_id: req.customerId
      },
      include:[
        // { model: RestaurantDetail, required:true, as: 'restaurant_detail' },
        { model: RestaurantBranch, required: true, as: 'restaurant_branch', include: [
          { model: Restaurant, required: true, as: 'restaurant' },
          {
            model: Menu, required:true, as: 'restaurant_branch_menu',
            include:[
              { model: MenuCategory, required:true, as: 'category', duplicating: true }
            ]
          }
        ]}
      ]
    })
    .then(restaurantEmployee => {
      console.log(restaurantEmployee);
      // // console.log(JSON.stringify(restaurant));
      res.json({
        status: true,
        message:'successfully fetched restaurant info',
        restaurantCustomer : restaurantEmployee
      });
    })
    .catch(err => {
      console.log("got error");
      console.log(err);
    });
}
/*
This function will be called in from FE when we load the web page by matching the website url. That time login does not required.
*/
module.exports.getRestaurantDetails = (req, res) => {
  var hostname = (new URL(req.headers.origin)).hostname;
  // var hostname = 'localhost';
  if(hostname.includes('localhost')){
    hostname = 'a3biriyani';
  }

  Restaurant.findOne(
    {
      where: {
        status: true,
        // [Op.or]: [{authorId: 12}, {authorId: 13}],
        // [Op.or]: [{url: { [Op.like]: '%' + hostname + '%' } }, { customer_id: req.customerId}]
        url: {
          [Op.like]: '%' + hostname + '%'
        }
      },
      include:[
        { model: RestaurantDetail, required:true, as: 'restaurant_detail' },
        { model: RestaurantBranch, required:true, as: 'restaurant_branches', include: [
          {
            model: Menu, required:true, as: 'restaurant_branch_menu',
            include:[
              { model: MenuCategory, required:true, as: 'category', duplicating: true }
            ]
          }
        ]}
      ]
    }
  )
  .then(restaurant => {
    // console.log(JSON.stringify(restaurant));
    res.json({
      status: true,
      message:'successfully fetched restaurant full details',
      restaurant : restaurant
    });
  })
  .catch(err => {
    console.log(err);
  })
  ;
}

module.exports.getRestaurantUrls = (callback) => {
  Restaurant.findAll({
    where: {
      status: true
    },
    attributes: ['url']
  })
  .then((resUrls) => {
    var urls =  _.map(resUrls, function(resUrl) {
      return resUrl.url; 
    });
    urls.push(constants.whitelistWebsites[process.env.ENVIRONMENT]);
    console.log("inside controller");
    console.log(urls);
    callback(urls);
  })
  .catch(err => console.log(err))
  ;
}

module.exports.saveContactRequest = (req, res, next) => {
  if(!req.body.email || !req.body.name || !req.body.message)
    return res.status(404).send({ message: "Parameter Missing." });

  var hostname = (new URL(req.headers.origin)).hostname;
  // var hostname = 'localhost';
  if(hostname.includes('localhost')){
    hostname = 'a3biriyani';
  }
  Restaurant.findOne(
    {
      where: {
        status: true,
        url: {
          [Op.like]: '%' + hostname + '%'
        }
      }
    })
    .then(restaurant => {
      if(!restaurant)
        return res.status(404).send({ message: "Restaurant not found." });
      ContactRequest.create({
        restaurant_id: restaurant.id,
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      })
      .then(contactRequest => {
        return res.status(200).send({ message: "Successfully saved the contact request." });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Not able to save the contact request." });
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send({ message: "Not able to save the contact request." });
    });
}

