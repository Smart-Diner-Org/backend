var constants = require('./../../config/constants');

module.exports.isMobileLoginRole = (roleId) => {
	return (req.body.role_id == constants.roles.customer) || (req.body.role_id == constants.roles.deliveryAgent);
}
module.exports.isEmailLoginRole = (roleId) => {
	return (req.body.role_id == constants.roles.customer) || (req.body.role_id == constants.roles.deliveryAgent);
}