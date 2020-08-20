const cron = require("node-cron");
checkForPayments = require('./check_for_payments');

module.exports.start = () => {
	cron.schedule("* * * * *", checkForPayments.checkAndUpdate);
}