const restaurantController = require("./restaurant.controller");
const dunzoController = require("./delivery_integrations/dunzo.controller");
const fcmController = require("./fcm.controller");

module.exports = {
	restaurantController,
	dunzoController,
	fcmController
};