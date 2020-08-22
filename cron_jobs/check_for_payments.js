Payment = require('../models/Payment');
constants = require('../config/constants');
const { paymentsController } = require("./../controllers/after_login");

exports.checkAndUpdate = () => {
	Payment.findAll({
		where: {
			payment_request_status : constants.instamojo.paymentRequestStatus.pending
		}
	})
	.then(payments => {
		if(payments && payments.length > 0){
			payments.forEach((payment, index) => {
				paymentsController.checkPaymentStatus(null, null, payment);
			});
		}
	})
	.catch(err => {

	})
	;
}