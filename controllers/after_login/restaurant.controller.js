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
var QuantityValue = require('./../../models/QuantityValue');
var MeasureValue = require('./../../models/MeasureValue');
var OrderPreBookDetail = require('./../../models/OrderPreBookDetail');
var RestaurantWebsiteDetail = require('./../../models/RestaurantWebsiteDetail');
var RestaurantPaymentGateway = require('./../../models/RestaurantPaymentGateway');
var RestaurantPaymentType = require('./../../models/RestaurantPaymentType');
var RestaurantGetLocationAssociation = require('./../../models/RestaurantGetLocationAssociation');
var DeliveryPartnerPreference = require('./../../models/DeliveryPartnerPreference');

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

module.exports.getMenuForBranch = (req, res) => {
  if(req.params.branchId){
    MenuCategory.findAll({
      where:{
        status: true
      },
      include: [
        { model: Menu, required: true, as: 'menus', where: { 'restuarant_branch_id': req.params.branchId, 'status': true },
        include: [
          {
            model: MenuQuantityMeasurePrice, required:false, as: 'menu_quantity_measure_price_list', where: { status: true },
            include:[
              { model: QuantityValue, required: true, as: 'quantity_values' },
              { model: MeasureValue, required: true, as: 'measure_values' }
            ]
          }
        ] },
      ]
    })
    .then(menus => {
      res.json({
        status: true,
        message:'successfully fetched menus',
        menus : menus
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
  }
  else{
    res.status(404).send({ message: 'Restaurant branch id is missing' });
  }
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

module.exports.getMenuQuantityMeasurePriceDetailsForOrder = (req, res, cb = null) => {
  if(req.params.orderId){
    OrderDetailMenu.findAll({
      where: {
        order_id: req.params.orderId
      },
      order: [
        ['id', 'DESC'],
        ['created_at', 'DESC'],
      ],
      include:[
        { model: OrderDetail, required:true, as: 'order_detail', required: true },
        { model: MenuQuantityMeasurePrice, required:true, as: 'menu_quantity_measure_price',
          include:[
            { model: Menu, required:true, as: 'menu' },
            { model: QuantityValue, required: true, as: 'quantity_values' },
            { model: MeasureValue, required: true, as: 'measure_values' }
          ]
        }
      ]
    })
    .then(orderMenuDetails => {
      if(req.isFromGetOrderStatus && cb){
        cb(orderMenuDetails);
      }
      else{
        res.json({
          status: true,
          message:'successfully fetched menu details',
          orderMenuDetails : orderMenuDetails
        });
      }
    })
    .catch(err => {
      console.log("got error");
      console.log(err);
      if(req.isFromGetOrderStatus && cb){
        cb(false);
      }
      else
        res.status(500).send({ message: err.message });
    });
  }
  else{
    if(req.isFromGetOrderStatus && cb){
      cb(false);
    }
    else
      return res.status(404).send({ message: "Branch id not found" });
  }
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
            // { model: MenuQuantityMeasurePrice, required:true, as: 'menu_quantity_measure_price',
            //   include:[
            //     { model: Menu, required:true, as: 'menu'},
            //     { model: QuantityValue, required: true, as: 'quantity_values' },
            //     { model: MeasureValue, required: true, as: 'measure_values' }
            //   ]
            // }
          ]
        },
        { model: OrderPreBookDetail, as: 'preBookingDetail'}
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

module.exports.getAllRestaurants = (req, res) => {
  Restaurant.findAll({
    where: {
      status: true
    },
    order: [
      ['id', 'Asc'],
      ['created_at', 'ASC'],
    ],
    include:[
      { model: RestaurantDetail, required: true, as: 'restaurant_detail' },
      { model: RestaurantBranch, required: true, as: 'restaurant_branches' },
    ]
  })
  .then(restaurants => {
    res.json({
      status: true,
      message:'successfully fetched all the restaurants',
      restaurants : restaurants
    });
  })
  .catch(err => {
    console.log("got error");
    console.log(err);
    res.status(500).send({ message: err.message });
  });
}

module.exports.setUpRestaurant = (req, res) => {
  console.log("I am within setUpRestaurant");
  console.log(req.isfromManualRestaurantSetup);
  console.log(req.hasAccountCreated);
  var restaurantDataToSave = {
    name: req.body.restaurantName,
    tracker_enabled: true
  }
  if(req.isfromManualRestaurantSetup && req.hasAccountCreated && req.createdCustomerId){
    console.log("req.createdCustomerId");
    console.log(req.createdCustomerId);
    restaurantDataToSave['customer_id'] = req.createdCustomerId;
  }
  else restaurantDataToSave['customer_id'] = req.customerId;
  if(req.body.templateId) restaurantDataToSave['template_id'] = req.body.templateId;
  if(req.body.logoUrl) restaurantDataToSave['logo'] = req.body.logoUrl;
  if(req.body.aboutContent) restaurantDataToSave['about'] = req.body.aboutContent;
  if(req.body.websiteUrl) restaurantDataToSave['url'] = req.body.websiteUrl;
  Restaurant.create(restaurantDataToSave)
  .then(createdRestaurant => {

    console.log("Created restaurant id");
    console.log(createdRestaurant.id);
    var restaurantDetailsDataToSave = {
      restaurant_id: createdRestaurant.id
    };
    if(req.body.facebookLink) restaurantDetailsDataToSave['facebook_link'] = req.body.facebookLink;
    if(req.body.instagramLink) restaurantDetailsDataToSave['instagram_link'] = req.body.instagramLink;
    if(req.body.youtubeLink) restaurantDetailsDataToSave['youtube_link'] = req.body.youtubeLink;
    if(req.body.twitterLink) restaurantDetailsDataToSave['twitter_link'] = req.body.twitterLink;
    if(req.body.linkedinLink) restaurantDetailsDataToSave['linkedin_link'] = req.body.linkedinLink;
    RestaurantDetail.create(restaurantDetailsDataToSave)
    .then(createdRestaurantDetail => {

      console.log("created Restaurant Detail id");
      console.log(createdRestaurantDetail.id);

      var branchesToSave = [];

      req.body.branches.forEach((branch, index) => {
        if(branch.branchName && branch.branchAddress && branch.branchCityId && branch.branchStateId && branch.branchContactNumber){
          var tempBranch = {
            restaurant_id : createdRestaurant.id,
            name: branch.branchName,
            address: branch.branchAddress,
            city_id: branch.branchCityId,
            state_id: branch.branchStateId,
            contact_number: branch.branchContactNumber
          };
          if(branch.branchTimings) tempBranch['timings'] = branch.branchTimings;
          if(branch.branchEmail) tempBranch['email'] = branch.branchEmail;
          if(branch.branchDeliveryLocations) tempBranch['delivery_locations'] = branch.branchDeliveryLocations;
          if(branch.branchDeliveryPostalCodes) tempBranch['delivery_postal_codes'] = branch.branchDeliveryPostalCodes;
          if(branch.branchDeliveryDistance) tempBranch['delivery_distance'] = branch.branchDeliveryDistance;
          if(branch.branchDeliveryLocationsToDisplay) tempBranch['delivery_locations_to_display'] = branch.branchDeliveryLocationsToDisplay;
          if(branch.branchDeliverySlots) tempBranch['delivery_slots'] = branch.branchDeliverySlots;
          branchesToSave.push(tempBranch);
        }
      });

      RestaurantBranch.bulkCreate(branchesToSave)
      .then(createdbranchesDetail => {

        console.log('createdbranchesDetail new');
        console.log(createdbranchesDetail[0]['id']);
        console.log(createdbranchesDetail[0]['name']);
        
        var restaurantEmployeeToSave = {
          customer_id : restaurantDataToSave['customer_id'],
          restuarant_branch_id : createdbranchesDetail[0]['id']
        };

        RestaurantEmployee.create(restaurantEmployeeToSave)
        .then(createdRestaurantEmployee => {

          var sliderImagesArray = [];
          if(req.body.sliderImages && req.body.sliderImages.length > 0){
            req.body.sliderImages.forEach((sliderImage, index) => {
              if(sliderImage.url){
                var tempSliderImage = {
                  url : sliderImage.url,
                  buttons: [
                    {"content":"Order Now", "button_link_type":"menu"},
                    {"content":"Call Us", "button_link_type":"contact_info"}
                  ]
                };
                if(sliderImage.content)
                  tempSliderImage['content'] = sliderImage.content;
                sliderImagesArray.push(tempSliderImage);
              }
            });
          }

          var cardsArray = [];
          if(req.body.cards){
            req.body.cards.forEach((card, index) => {
              if(card.url){
                cardsArray.push({
                  url : card.url
                });
              }
            });
          }
          var restaurantWebsiteDetailsToSave = {
            restaurant_id: createdRestaurant.id,
            is_pre_booking_enabled: req.body.isPrebookingEnabled,
            is_pre_booking_time_required:  req.body.isPreBookingTimeRequired,
            pre_book_prior_time: req.body.preBookPriorTime ? req.body.preBookPriorTime : null, 
            page_description: req.body.pageDescription ? req.body.pageDescription : null,
            slider_images: (sliderImagesArray && sliderImagesArray.length > 0) ? JSON.stringify(sliderImagesArray) : null,
            ga_tracking_id: req.body.gaTrackingId ? req.body.gaTrackingId : null,
            about_image: req.body.aboutImageUrl ? req.body.aboutImageUrl : null,
            pre_order_info_image: req.body.preOrderInfoImage ? req.body.preOrderInfoImage : null,
            is_run_time_booking_enabled: req.body.isRunTimeBookingEnabled ? req.body.isRunTimeBookingEnabled : false,
            primary_colour_code: req.body.primaryColourCode ? req.body.primaryColourCode : null,
            secondary_colour_code: req.body.secondaryColourCode ? req.body.secondaryColourCode : null,
            has_customisation_info: req.body.hasCustomisationInfo ? req.body.hasCustomisationInfo : false,
            customisation_info_content: req.body.customisationInfoContent ? req.body.customisationInfoContent : null,
            cards: (cardsArray && cardsArray.length > 0) ? JSON.stringify(cardsArray) : null,
            is_delivery_available: req.body.isDeliveryAvailable ? req.body.isDeliveryAvailable : false,
            page_title: req.body.pageTitle ? req.body.pageTitle : null
          };

          RestaurantWebsiteDetail.create(restaurantWebsiteDetailsToSave)
          .then(createdRestaurantWebsiteDetails => {

            var paymentTypesToSave = [];
            if(req.body.isCodEnabled){
              paymentTypesToSave.push({
                restaurant_id: createdRestaurant.id,
                payment_type_id: constants.paymentType.cashOnDelivery
              });
            }
            if(req.body.isOnlinePaymentEnabled){
              paymentTypesToSave.push({
                restaurant_id: createdRestaurant.id,
                payment_type_id: constants.paymentType.onlinePayment
              });
            }
            RestaurantPaymentType.bulkCreate(paymentTypesToSave)
            .then(createdRestaurantPaymentType => {

              //This one we will do separately

              // if(req.body.isOnlinePaymentEnabled){
              //   restaurantPaymentGatewayToSave = {
              //     restaurant_id: createdRestaurant.id,
              //     payment_gateway_id: 
              //     api_key:
              //     auth_token:
              //   };
              // RestaurantPaymentGateway.create(restaurantPaymentGatewayToSave)
              // }
              
              var getLocationAssociationToSave = {
                restaurant_id: createdRestaurant.id,
                get_location_type_id: req.body.getLocationPlaceId,
                get_location_place_id: req.body.getLocationTypeId
              };

              RestaurantGetLocationAssociation.create(getLocationAssociationToSave)
              .then(createdRestaurantGetLocationAssociation => {
                res.json({
                  status: true,
                  createdbranchesDetail: createdbranchesDetail,
                  message:'successfully created the restaurants'
                });
              })
              .catch(err => {
                console.log("Got error while creating restaurant get location association details.");
                console.log(err);
                res.status(500).send({ message: err.message });
              });

            })
            .catch(err => {
              console.log("Got error while creating restaurant payment types.");
              console.log(err);
              res.status(500).send({ message: err.message });
            });
          })
          .catch(err => {
            console.log("Got error while creating restaurant website details.");
            console.log(err);
            res.status(500).send({ message: err.message });
          });
        })
        .catch(err => {
          console.log("Got error while creating restaurant employee.");
          console.log(err);
          res.status(500).send({ message: err.message });
        });
      })
      .catch(err => {
        console.log("Got error while creating restaurant branches.");
        console.log(err);
        res.status(500).send({ message: err.message });
      });
    })
    .catch(err => {
      console.log("Got error while creating restaurant detail.");
      console.log(err.message);
      res.status(500).send({ message: err.message });
    });
  })
  .catch(err => {
    console.log("Got error while creating a restaurant.");
    console.log(err.message);
    res.status(500).send({ message: err.message });
  });
}

module.exports.setUpRestaurantWithAccountCreation = (req, res) => {
  console.log("I am within setUpRestaurantWithAccountCreation");
  console.log(req.isfromManualRestaurantSetup);
  console.log(req.hasAccountCreated);
  
}

module.exports.setUpRestaurantWithoutAccountCreation = (req, res) => {
  console.log("I am within setUpRestaurantWithoutAccountCreation");
  console.log(req.isfromManualRestaurantSetup);
  console.log(req.hasAccountCreated);
  
}
