const Sequelize = require('sequelize');
var db = require('./../config/database');
// var RestaurantDetail = require('./RestaurantDetail')

const CustomerDetail = db.define('customer_details', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	address: {
		type: Sequelize.TEXT
	},
	city_id: {
		type: Sequelize.BIGINT
	},
	state_id: {
		type: Sequelize.BIGINT
	},
	primary: {
		type: Sequelize.BOOLEAN
	},
	address_type: {
		type: Sequelize.BIGINT
	},
	lat: {
		type: Sequelize.DECIMAL
	},
	long: {
		type: Sequelize.DECIMAL
	}
},{
	underscored: true
});

module.exports = CustomerDetail;