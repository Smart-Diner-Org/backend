Payment = require('../models/Payment');
constants = require('../config/constants');
const { paymentsController } = require("./../controllers/after_login");

exports.checkAndUpdate = () => {
	// return;
	console.log("running a task every minute");
	console.log(new Date().getMinutes());
	Payment.findAll({
		where: {
			payment_request_status : constants.instamojo.paymentRequestStatus.pending
		}
	})
	.then(payments => {
		// console.log(payments.length);
		// console.log(payments);
		if(payments && payments.length > 0){
			// paymentsController.checkPaymentStatus(null, null, payments[0]);
			payments.forEach((payment, index) => {
				// console.log(payment.payment_request_id);
				// console.log("Calling 1 " + index);
				paymentsController.checkPaymentStatus(null, null, payment);
			});
		}
	})
	.catch(err => {

	})
	;
}