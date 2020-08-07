const Sequelize = require('sequelize');
var db = require('./../config/database');

const PaymentStatus = db.define('payment_statuses', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = PaymentStatus;