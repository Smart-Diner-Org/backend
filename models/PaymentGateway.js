const Sequelize = require('sequelize');
var db = require('./../config/database');

const PaymentGateway = db.define('payment_gateways', {
	name: {
		type: Sequelize.STRING
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = PaymentGateway;