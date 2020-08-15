const cron = require("node-cron");
checkForPayments = require('./check_for_payments');

module.exports.start = () => {
	return;
	cron.schedule("* * * * *", checkForPayments.checkAndUpdate);
}