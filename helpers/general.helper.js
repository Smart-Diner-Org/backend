var constants = require('./../config/constants');
var PaymentStatus = require('./../models/PaymentStatus');

module.exports.isMobileLoginRole = (roleId) => {
	return (roleId == constants.roles.customer) || (roleId == constants.roles.deliveryAgent);
}
module.exports.isEmailLoginRole = (roleId) => {
	return (roleId == constants.roles.superAdmin) || (roleId == constants.roles.admin);
}
module.exports.getPaymentStatusId = (statusName, cb) => {
	var paymentStatusId = null;
	try{
		PaymentStatus.findAll({
			attributes: ['name', 'id']
		})
		.then(paymentStatuses => {
			if (paymentStatuses) {
				var matchingName = null;
				switch(statusName){
					case 'paid':
						matchingName = 'Paid';
					break;
					case 'notPaid':
						matchingName = 'Not Paid';
					break;
					case 'paymentFailed':
						matchingName = 'Payment Failed';
					break;
					case 'paymentRequestFailed':
						matchingName = 'Payment Request Failed';
					break;
				}
				paymentStatuses.forEach(status => {
					if(status["name"].trim() === matchingName.trim()){
						paymentStatusId = status["id"];
					}
				});
			}
			else{
				console.log("Payment Statuses are not found. Inside general helper function.");
			}
			return cb(paymentStatusId);
		})
		.catch(err => {
			console.log("Exception happened while getting payment statuses inside general helper function.");
			return cb(paymentStatusId);
		});
	}
	catch (e) {
		console.log("Exception happened inside general helper function.");
		console.log(e);
		return cb(paymentStatusId);
	}
}