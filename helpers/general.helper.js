var constants = require('./../config/constants');

module.exports.isMobileLoginRole = (roleId) => {
	return (roleId == constants.roles.customer) || (roleId == constants.roles.deliveryAgent);
}
module.exports.isEmailLoginRole = (roleId) => {
	return (roleId == constants.roles.superAdmin) || (roleId == constants.roles.admin);
}
module.exports.getPaymentStatusId = (paymentStatuses, statusName) => {
	var paymentStatusId = null;
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
	return paymentStatusId;
}