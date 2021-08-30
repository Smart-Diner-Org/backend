const express = require("express");
var router = express.Router();
// var customerController = require('./../../controllers/after_login/customer.controller');
// var customerController = require('./../../controllers/after_login/customer.controller');
const { fcmController, customerController, orderController, paymentsController, restaurantController, generalController, deliveryController, menuController } = require("./../../controllers/after_login");
const authController = require("./../../controllers/auth.controller");
var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
const { authJwt, verificationsToPlaceOrder, verificationsToSetupRestaurant, verifySignUp } = require("../../middlewares");
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
  //corsOptions = helper.getCorsFunction(urls);
  corsOptions='*';

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
  router.get('/get_cities', [
      cors(corsOptions),
      authJwt.verifyToken
    ],
    generalController.getCities);
  router.get('/get_states', [
      cors(corsOptions),
      authJwt.verifyToken
    ],
    generalController.getStates);
  router.get('/get_restaurant_cancellation_reasons', generalController.getRestaurantCancellationReasons);
  router.get('/order/:orderId/get_menu_quantity_measure_price_details', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessRestaurantDetails ], restaurantController.getMenuQuantityMeasurePriceDetailsForOrder);
  router.post('/order/:orderId/assign_delivery_partner',
    [
      cors(corsOptions),
      authJwt.verifyToken,
      authJwt.canAssignDelivery
    ],
    deliveryController.assignDeliveryPartnerForOrder);
    router.post('/order/accept_delivery/:deliveryRequestId',
      [
        cors(corsOptions),
        authJwt.verifyToken,
        authJwt.canUpdateDeliveryStage
      ],
      deliveryController.acceptDelivery
    );
    router.post('/order/update_delivery_request_stage/:deliveryRequestId',
      [
        cors(corsOptions),
        authJwt.verifyToken,
        authJwt.canUpdateDeliveryStage
      ],
      deliveryController.updateDeliveryRequestStage
    );
    router.get('/delivery_agent/get_all_delivery_requests',
      [
        cors(corsOptions),
        authJwt.verifyToken,
        authJwt.isDeliveryPartner
      ],
      deliveryController.getAllRequestsOfDeliveryPartner
    );
  router.get('/restaurants/all', [ cors(corsOptions), authJwt.verifyToken, authJwt.canAccessAllRestaurants ], restaurantController.getAllRestaurants);
  router.post('/restaurant/setup_with_account_creation', [
      cors(corsOptions),
      authJwt.verifyToken,
      verificationsToSetupRestaurant.canSetupRestaurant,
      verifySignUp.checkForMobileAndRole,
      verifySignUp.checkForEmail,
      verificationsToSetupRestaurant.checkForAccountHolderName,
      verificationsToSetupRestaurant.checkForPassword,
      verifySignUp.checkDuplicateMobileOrEmail,
      verifySignUp.checkDuplicateMobile,
      verificationsToSetupRestaurant.checkAttributesForToCreateRestaurant,
      verificationsToSetupRestaurant.checkAttributesForToCreateRestaurantBranches,
      verificationsToSetupRestaurant.checkAttributesToCreateRestaurantWebsiteDetails,
      authController.signup
    ],
    restaurantController.setUpRestaurant);
  router.get('/get_menu_categories', [
      cors(corsOptions),
      authJwt.verifyToken
    ],
    menuController.getMenuCategoriesList);
  router.post('/add_menu_categories', [
      cors(corsOptions),
      authJwt.verifyToken,
      verificationsToSetupRestaurant.canAddEditMenuWithCategories
    ],
    menuController.addMenuCategories);
  router.get('/order/:orderId/get_invoice', [
      cors(corsOptions),
      authJwt.verifyToken,
      authJwt.canGetInvoice
    ],
    orderController.getInvoiceForTheOrder);

  router.post('/create_menu_with_category', [
      cors(corsOptions),
      authJwt.verifyToken,
      verificationsToSetupRestaurant.canAddEditMenuWithCategories,
      verificationsToSetupRestaurant.checkAttributesToAddEditMenuWithCategories
    ],
    menuController.createMenuwithCategory);
  router.post('/update_menu_with_category', [
      cors(corsOptions),
      authJwt.verifyToken,
      verificationsToSetupRestaurant.canAddEditMenuWithCategories,
      verificationsToSetupRestaurant.checkAttributesToAddEditMenuWithCategories
    ],
    menuController.updateMenuwithCategory);
  router.get('/get_quantity_measure_values', [
      cors(corsOptions),
      authJwt.verifyToken
    ],
    menuController.getQuantityMeasureValueList);

  // router.post('/uploadToS3',menuController.uploadToS3);

  // router.post('/restaurant/setup_without_account_creation', [
  //   // cors(corsOptions),
  //   // authJwt.verifyToken,
  //   verificationsToSetupRestaurant.canSetupRestaurant,
  //   verificationsToSetupRestaurant.checkAttributesForToCreateRestaurant,

  // ],
  // restaurantController.setUpRestaurant);

  router.post('/app/fcm/token/:customerId/store', cors(corsOptions), fcmController.savePushNotificationTokenWithCustomerId);

})
.catch(err => console.log(err))
;
module.exports = router;
