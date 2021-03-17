const authJwt = require("./auth_jwt");
const verifySignUp = require("./verify_sign_up");
const verificationsToPlaceOrder = require("./verifications_to_place_order");
const verificationsToSetupRestaurant = require("./verifications_to_setup_restaurant");

module.exports = {
	authJwt,
	verifySignUp,
	verificationsToPlaceOrder,
	verificationsToSetupRestaurant
};
