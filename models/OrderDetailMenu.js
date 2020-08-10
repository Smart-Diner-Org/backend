const Sequelize = require('sequelize');
var db = require('./../config/database');
// var OrderDetail = require('./OrderDetail');
// var Menu = require('./Menu');

const OrderDetailMenu = db.define('order_details_menus', {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true
	},
	order_detail_id: {
		type: Sequelize.BIGINT
	},
	menu_id: {
		type: Sequelize.BIGINT
	}
},{
	underscored: true
});

// OrderDetail.belongsToMany(Menu, {
// 	foreignKey: 'order_id',
// 	as: 'order'
// });

// OrderDetail.belongsToMany(Menu, {
// 	through : OrderDetailMenu
// });

// OrderDetail.hasOne(Menu, {
// 	foreignKey: 'menu_id',
// 	as: 'menu'
// });

module.exports = OrderDetailMenu;