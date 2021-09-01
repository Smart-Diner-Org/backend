const restaurantController = require("./restaurant.controller");
const dunzoController = require("./delivery_integrations/dunzo.controller");
const pushNotificationController = require("./push_notification.controller");

module.exports = {
	restaurantController,
	dunzoController,
	pushNotificationController
};