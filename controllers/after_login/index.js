const customerController = require("./customer.controller");
const orderController = require("./order.controller");
const paymentsController = require("./payments.controller");
const restaurantController = require("./restaurant.controller");
var generalController = require("./general.controller");

module.exports = {
	customerController,
	orderController,
	paymentsController,
	restaurantController,
	generalController
};