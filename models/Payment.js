const Sequelize = require('sequelize');
var db = require('./../config/database');
var Refund = require('./Refund');

const Payment = db.define('payments', {
	order_id: {
		type: Sequelize.BIGINT
	},
	payment_request_id: {
		type: Sequelize.TEXT
	},
	payment_id: {
		type: Sequelize.TEXT
	},
	purpose: {
		type: Sequelize.TEXT
	},
	amount: {
		type: Sequelize.DECIMAL
	},
	payment_request_status: {
		type: Sequelize.STRING
	},
	payment_status: {
		type: Sequelize.STRING
	},
	payment_url_long: {
		type: Sequelize.TEXT
	},
	restaurant_payment_gateway_id: {
		type: Sequelize.BIGINT
	}
},{
	underscored: true
});

Payment.hasMany(Refund, {
	foreignKey: 'payment_id',
	as: 'payment'
});

Refund.belongsTo(Payment, {
	foreignKey: 'payment_id',
	as: 'payment'
});

module.exports = Payment;