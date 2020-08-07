const Sequelize = require('sequelize');
var db = require('./../config/database');
// var Role = require('./Role');
// var CustomerDetail = require('./CustomerDetail');

const Order = db.define('orders', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	restuarant_branch_id: {
		type: Sequelize.BIGINT
	},
	description: {
		type: Sequelize.TEXT
	},
	total_price: {
		type: Sequelize.DECIMAL
	},
	stage_id: {
		type: Sequelize.BIGINT
	},
	payment_status_id: {
		type: Sequelize.BIGINT
	},
	mode_of_delivery_id: {
		type: Sequelize.BIGINT
	},
	delivery_address: {
		type: Sequelize.TEXT
	},
	delivery_g_location: {
		type: Sequelize.TEXT
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

// Customer.belongsTo(Role, {
// 	foreignKey: 'role_id',
// 	as: 'role'
// });
// Customer.hasOne(CustomerDetail, {
// 	foreignKey: 'customer_id',
// 	as: 'customer_detail'
// });

module.exports = Order;