const customerController = require("./customer.controller");
const orderController = require("./order.controller");
const paymentsController = require("./payments.controller");
const restaurantController = require("./restaurant.controller");
var generalController = require("./general.controller");
const deliveryController = require("./delivery.controller");
const menuController = require("./menu.controller");
const fcmController = require("./fcm.controller");
const pushNotificationController = require("./push_notification.controller");
const dunzoController = require("./delivery_integrations/dunzo.controller");

module.exports = {
	customerController,
	orderController,
	paymentsController,
	restaurantController,
	generalController,
	deliveryController,
	menuController,
	fcmController,
	pushNotificationController,
	dunzoController
};