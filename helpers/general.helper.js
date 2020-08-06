var constants = require('./../config/constants');

module.exports.isMobileLoginRole = (roleId) => {
	return (roleId == constants.roles.customer) || (roleId == constants.roles.deliveryAgent);
}
module.exports.isEmailLoginRole = (roleId) => {
	return (roleId == constants.roles.superAdmin) || (roleId == constants.roles.admin);
}