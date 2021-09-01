const cron = require("node-cron");
checkForPayments = require('./check_for_payments');
var DeliveryController = require('./../controllers/after_login/delivery.controller');

module.exports.start = () => {
	// return;
	console.log("Gonna start cron...");
	cron.schedule("* * * * *", checkForPayments.checkAndUpdate);
	// cron.schedule("*/30 * * * * *", DeliveryController.taskStatusesToBeChecked);
}