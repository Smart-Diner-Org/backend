var Menu = require('./../../models/Menu');
var MenuCategory = require('./../../models/MenuCategory');
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var RestaurantDetail = require('./../../models/RestaurantDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var _ = require('underscore');

module.exports.getMenu = (req, res, next) => {
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

module.exports.getRestaurantDetails = (req, res, next) => {
  console.log("I have come here 3...");
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
      message:'successfully fetched menus',
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