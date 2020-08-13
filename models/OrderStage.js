const Sequelize = require('sequelize');
var db = require('./../config/database');

const OrderStage = db.define('order_stages', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = OrderStage;