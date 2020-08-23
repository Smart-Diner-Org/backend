const Sequelize = require('sequelize');
var db = require('./../config/database');
var Menu = require('./Menu');

const OrderDetail = db.define('order_details', {
	quantity: {
		type: Sequelize.INTEGER
	},
	price: {
		type: Sequelize.DECIMAL
	},
	original_price: {
		type: Sequelize.DECIMAL
	}
},{
	underscored: true
});

module.exports = OrderDetail;