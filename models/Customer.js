const Sequelize = require('sequelize');
var db = require('./../config/database');
var Role = require('./Role');

const Customer = db.define('customers', {
	name: {
		type: Sequelize.CHAR
	},
	email: {
		type: Sequelize.CHAR
	},
	mobile: {
		type: Sequelize.CHAR
	},
	password: {
		type: Sequelize.CHAR
	},
	role_id: {
		type: Sequelize.BIGINT
	},
	mobile_verification: {
		type: Sequelize.BOOLEAN
	},
	remember_token: {
		type: Sequelize.CHAR
	},
	otp_secret: {
		type: Sequelize.CHAR
	},
	uuid: {
		type: Sequelize.CHAR
	}
},{
	underscored: true
});

Customer.belongsTo(Role, {
	foreignKey: 'role_id',
	as: 'role'
});

module.exports = Customer;