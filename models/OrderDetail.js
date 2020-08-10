const Sequelize = require('sequelize');
var db = require('./../config/database');
var Order = require('./Order');
var OrderDetailMenu = require('./OrderDetailMenu');
var Menu = require('./Menu');

const OrderDetail = db.define('order_details', {
	order_id: {
		type: Sequelize.BIGINT
	},
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

OrderDetail.belongsTo(Order, {
	foreignKey: 'order_id',
	as: 'order'
});

OrderDetail.belongsToMany(Menu, { through: OrderDetailMenu });

module.exports = OrderDetail;