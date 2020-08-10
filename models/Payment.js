const Sequelize = require('sequelize');
var db = require('./../config/database');

const Payment = db.define('payments', {
	order_id: {
		type: Sequelize.BIGINT
	},
	payment_id: {
		type: Sequelize.TEXT
	},
	purpose: {
		type: Sequelize.TEXT
	},
	status: {
		type: Sequelize.STRING
	},
	payment_url_long: {
		type: Sequelize.TEXT
	},
},{
	underscored: true
});

module.exports = Payment;