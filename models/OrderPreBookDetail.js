const Sequelize = require('sequelize');
var db = require('./../config/database');

const OrderPreBookDetail = db.define('order_pre_book_details', {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true
	},
	order_id: {
		type: Sequelize.BIGINT
	},
	date_of_delivery: {
		type: Sequelize.DATEONLY
	},
	time_of_delivery: {
		type: Sequelize.STRING
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = OrderPreBookDetail;