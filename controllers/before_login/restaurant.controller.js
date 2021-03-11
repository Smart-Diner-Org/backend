var Menu = require('./../../models/Menu');
var MenuCategory = require('./../../models/MenuCategory');
var Customer = require('./../../models/Customer');
var Restaurant = require('./../../models/Restaurant');
var Order = require('./../../models/Order');
var OrderDetailMenu = require('./../../models/OrderDetailMenu');
var OrderDetail = require('./../../models/OrderDetail');
var constants = require('./../../config/constants');
var RestaurantDetail = require('./../../models/RestaurantDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var _ = require('underscore');
const { URL } = require('url');
var ContactRequest = require('./../../models/ContactRequest');
// var RestaurantEmployee = require('./../../models/RestaurantEmployee');
var RestaurantWebsiteDetail = require('./../../models/RestaurantWebsiteDetail');
var Subscription = require('./../../models/Subscription');
var QuantityValue = require('./../../models/QuantityValue');
var MeasureValue = require('./../../models/MeasureValue');
var MenuQuantityMeasurePrice = require('./../../models/MenuQuantityMeasurePrice');
var RestaurantPaymentType = require('./../../models/RestaurantPaymentType');
var PaymentType = require('./../../models/PaymentType');
var RestaurantGetLocationAssociation = require('./../../models/RestaurantGetLocationAssociation');
var GetLocationType = require('./../../models/GetLocationType');
var GetLocationPlace = require('./../../models/GetLocationPlace');
var RestaurantMenuCategorySequence = require('./../../models/RestaurantMenuCategorySequence');

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

/*
This function will be called in from FE when we load the web page by matching the website url. That time login does not required.
*/
module.exports.getRestaurantDetails = (req, res) => {
  var hostname = (new URL(req.headers.origin)).hostname;
  // var hostname = 'localhost';
  // if(hostname.includes('localhost')){
  //   hostname = 'testingfrontend.smartdiner.co';
  // }
  console.log("hostname...");
  console.log(hostname);
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
          /*{
            model: Menu, required:true, as: 'restaurant_branch_menu', where: { status: true },
            // include: { all: true, nested: true }
            include:[
              { model: MenuCategory, required:true, as: 'category', duplicating: true }
            ]
          }*/
        ]},
        { model: RestaurantWebsiteDetail, as: 'restaurant_website_detail'},
        { model: RestaurantPaymentType, required: true, as: 'payment_types',
          include: [
            { model: PaymentType, required: true, duplicating: true, as: 'payment_type' }
          ]
        },
        { model: RestaurantGetLocationAssociation, as: 'get_location_info',
          include: [
            { model: GetLocationType, as: 'get_location_type' },
            { model: GetLocationPlace, as: 'get_location_place' }
          ]
        }
      ],
      // order: [
      //   [
      //     {model: RestaurantBranch, as: 'restaurant_branches'},
      //     {model: Menu, as: 'restaurant_branch_menu'}, 'id', 'ASC',
      //   ]
      // ]
    }
  )
  .then(restaurant => {
    this.getMenuForBranch({ branchId: restaurant.restaurant_branches[0].id}, null, function(menus){
      res.json({
        status: true,
        message:'successfully fetched restaurant full details',
        restaurant : restaurant,
        menus: menus
      });
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).send({ message: err.message });
  });
}

module.exports.getMenuForBranch = (req, res, cb = null) => {
  if(req.branchId){
    MenuCategory.findAll({
      where:{
        status: true
      },
      order: [
        [
          { model: RestaurantMenuCategorySequence, as: 'restaurant_sequences' }, 'display_sequence', 'ASC'
        ],
        [
          { model: Menu, as: 'menus' }, 'is_available', 'DESC'
        ],
        [
          { model: Menu, as: 'menus' }, 'id', 'ASC'
        ],
        [ Menu, { model: MenuQuantityMeasurePrice, as: 'menu_quantity_measure_price_list' }, 'display_order', 'ASC' ]
      ],
      include: [
        { model: RestaurantMenuCategorySequence, as: 'restaurant_sequences', where: { 'restuarant_branch_id': req.branchId, 'status': true } },
        { model: Menu, required: true, as: 'menus', where: { 'restuarant_branch_id': req.branchId, 'status': true },
        include: [
          {
            model: MenuQuantityMeasurePrice, required:false, as: 'menu_quantity_measure_price_list', where: { status: true, can_display_to_customer: true },
            include:[
              { model: QuantityValue, required: true, as: 'quantity_values' },
              { model: MeasureValue, required: true, as: 'measure_values' }
            ]
          }
        ] },
      ]
    })
    // RestaurantMenuCategorySequence.findAll({
    //   where:{
    //     status: true
    //   },
    //   order: [
    //     ['display_sequence', 'ASC']
    //   ],
    //   include: [
    //     { model: MenuCategory, required: true, as: 'category',
    //       include: [
    //         { model: Menu, required: true, as: 'menus', where: { 'restuarant_branch_id': req.branchId, 'status': true },
    //           include: [
    //             {
    //               model: MenuQuantityMeasurePrice, required:false, as: 'menu_quantity_measure_price_list', where: { status: true },
    //               include:[
    //                 { model: QuantityValue, required: true, as: 'quantity_values' },
    //                 { model: MeasureValue, required: true, as: 'measure_values' }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // })
    .then(menus => {
      console.log("******** menus starts ******");
      console.log(menus);
      console.log("******** menus ends ******");
      if(cb){
        return cb(menus);
      }
      else{
        res.json({
          status: true,
          message:'successfully fetched menus',
          menus : menus
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
  }
  else{
    if(cb){
      return cb(false);
    }
    else res.status(404).send({ message: 'Restaurant branch id is missing' });
  }
}

module.exports.getMenuForBranchOld = (req, res, cb = null) => {
  if(req.branchId){
    Menu.findAll({
      where: {
        'restuarant_branch_id': req.branchId,
        'status': true
      },
      order: [
        ['id', 'ASC'],
        [
          { model: MenuQuantityMeasurePrice, as: 'menu_quantity_measure_price_list' }, 'id', 'ASC',
        ]
      ],
      include:[
        { model: MenuCategory, required: true, as: 'category' },
        {
          model: MenuQuantityMeasurePrice, required:false, as: 'menu_quantity_measure_price_list', where: { status: true },
          include:[
            { model: QuantityValue, required: true, as: 'quantity_values' },
            { model: MeasureValue, required: true, as: 'measure_values' }
          ]
        }
      ]
    })
    .then(menus => {
      if(cb){
        return cb(menus);
      }
      else{
        res.json({
          status: true,
          message:'successfully fetched menus',
          menus : menus
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
  }
  else{
    if(cb){
      return cb(false);
    }
    else res.status(404).send({ message: 'Restaurant branch id is missing' });
  }
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
  // if(hostname.includes('localhost')){
  //   hostname = 'testing.smartdiner.co';
  // }
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
        message: req.body.message,
        subject: req.body.subject ? req.body.subject : null
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

module.exports.saveSubscription = (req, res, next) => {
  if(!req.body.email)
    return res.status(404).send({ message: "Parameter Missing." });
  var hostname = (new URL(req.headers.origin)).hostname;
  // var hostname = 'localhost';
  // if(hostname.includes('localhost')){
  //   hostname = 'testing.smartdiner.co';
  // }
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
      Subscription.create({
        restaurant_id: restaurant.id,
        email: req.body.email
      })
      .then(contactRequest => {
        return res.status(200).send({ message: "Successfully saved the subscription request." });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Not able to save the subscription request." });
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send({ message: "Not able to save the subscription request." });
    });
}

