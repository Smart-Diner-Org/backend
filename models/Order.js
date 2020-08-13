const Sequelize = require('sequelize');
var db = require('./../config/database');
var Payment = require('./Payment');
var Cancellation = require('./Cancellation');

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
	delivery_address_one: {
		type: Sequelize.TEXT
	},
	delivery_address_two: {
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
Order.hasMany(Payment, {
	foreignKey: 'order_id',
	as: 'payments'
});
Payment.belongsTo(Order, {
	foreignKey: 'order_id',
	as: 'order'
});
Order.hasOne(Cancellation, {
	foreignKey: 'order_id',
	as: 'order'
});

module.exports = Order;