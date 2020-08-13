const Sequelize = require('sequelize');
var db = require('./../config/database');

const Refund = db.define('refunds', {
	payment_id: {
		type: Sequelize.BIGINT
	},
	transaction_id: {
		type: Sequelize.TEXT
	},
	type: {
		type: Sequelize.STRING
	},
	body: {
		type: Sequelize.TEXT
	},
	status: {
		type: Sequelize.STRING
	},
	refund_id: {
		type: Sequelize.TEXT
	},
	refund_amount: {
		type: Sequelize.DECIMAL
	},
	total_amount: {
		type: Sequelize.DECIMAL	
	}
},{
	underscored: true
});

module.exports = Refund;