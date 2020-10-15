Payment = require('../models/Payment');
PaymentGateway = require('../models/PaymentGateway');
RestaurantPaymentGateway = require('../models/RestaurantPaymentGateway');
constants = require('../config/constants');
const { paymentsController } = require("./../controllers/after_login");

exports.checkAndUpdate = () => {
	Payment.findAll({
		where: {
			payment_request_status : constants.instamojo.paymentRequestStatus.pending
		},
		include:[
        	{ model: RestaurantPaymentGateway, required: true, as: 'restaurant_payment_gateway' }
        ]
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