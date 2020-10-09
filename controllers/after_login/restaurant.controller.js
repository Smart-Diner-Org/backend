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
var RestaurantEmployee = require('./../../models/RestaurantEmployee');
var MenuQuantityMeasurePrice = require('./../../models/MenuQuantityMeasurePrice');

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
      { model: Customer, required: true, as: 'customer' },
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
      restaurantEmployee : restaurantEmployee
    });
  })
  .catch(err => {
    console.log("got error");
    console.log(err);
    res.status(500).send({ message: err.message });
  });
}

module.exports.getOrdersForBranch = (req, res) => {
  if(req.params.branchId){
    Order.findAll({
      where: {
        restuarant_branch_id: req.params.branchId
      },
      order: [
        ['id', 'DESC'],
        ['created_at', 'DESC'],
      ],
      include:[
        { model: Customer, required: true, as: 'customer'},
        { model: OrderDetailMenu, required: true, as: 'order_detail_menus',
          include:[
            { model: OrderDetail, required:true, as: 'order_detail'},
            { model: MenuQuantityMeasurePrice, required:true, as: 'menu_quantity_measure_price',
              include:[
                { model: Menu, required:true, as: 'menu'}
              ]
            }
          ]
        }
      ]
    })
    .then(orders => {
      res.json({
        status: true,
        message:'successfully fetched orders',
        orders : orders
      });
    })
    .catch(err => {
      console.log("got error");
      console.log(err);
      res.status(500).send({ message: err.message });
    });
  }
  else{
    return res.status(404).send({ message: "Branch id not found" });
  }
}

