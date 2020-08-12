const Sequelize = require('sequelize');
var db = require('./../config/database');

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
	payment_request_status: {
		type: Sequelize.STRING
	},
	payment_status: {
		type: Sequelize.STRING
	},
	payment_url_long: {
		type: Sequelize.TEXT
	},
},{
	underscored: true
});

module.exports = Payment;