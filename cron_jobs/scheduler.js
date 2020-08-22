const cron = require("node-cron");
checkForPayments = require('./check_for_payments');

module.exports.start = () => {
	// return;
	console.log("Gonna start cron...");
	cron.schedule("* * * * *", checkForPayments.checkAndUpdate);
}