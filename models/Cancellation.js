const Sequelize = require('sequelize');
var db = require('./../config/database');

const Cancellation = db.define('cancellations', {
	order_id: {
		type: Sequelize.BIGINT
	},
	cancellation_reason: {
		type: Sequelize.TEXT
	},
	time_of_cancellation: {
		type: Sequelize.STRING
	},
	customer_id: {
		type: Sequelize.BIGINT
	}
},{
	underscored: true
});

module.exports = Cancellation;