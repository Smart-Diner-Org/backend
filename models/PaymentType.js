const Sequelize = require('sequelize');
var db = require('./../config/database');

const PaymentType = db.define('payment_types', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = PaymentType;