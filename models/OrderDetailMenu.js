const Sequelize = require('sequelize');
var db = require('./../config/database');
var Order = require('./Order');
var Menu = require('./Menu');

const OrderDetailMenu = db.define('order_details_menus', {
	order_detail_id: {
		type: Sequelize.BIGINT
	},
	menu_id: {
		type: Sequelize.BIGINT
	}
},{
	underscored: true
});

// OrderDetail.belongsTo(Order, {
// 	foreignKey: 'order_id',
// 	as: 'order'
// });

// OrderDetail.hasOne(Menu, {
// 	foreignKey: 'menu_id',
// 	as: 'menu'
// });

module.exports = OrderDetailMenu;