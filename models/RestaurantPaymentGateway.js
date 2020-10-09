const Sequelize = require('sequelize');
var db = require('./../config/database');

const RestaurantPaymentGateway = db.define('restaurant_payment_gateways', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	payment_gateway_id: {
		type: Sequelize.BIGINT
	},
	api_key: {
		type: Sequelize.TEXT
	},
	auth_token: {
		type: Sequelize.TEXT
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = RestaurantPaymentGateway;