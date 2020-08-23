const Sequelize = require('sequelize');
var db = require('./../config/database');
var OrderDetail = require('./OrderDetail');
var Menu = require('./Menu');
var Order = require('./Order');

const OrderDetailMenu = db.define('order_details_menus', {
	id: {
		type: Sequelize.BIGINT,
		autoIncrement: true,
		primaryKey: true
	},
	order_id: {
		type: Sequelize.BIGINT
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

Order.hasMany(OrderDetailMenu, {
	foreignKey: 'order_id',
	as: 'order_detail_menus'
});

OrderDetailMenu.belongsTo(Order, {
	foreignKey: 'order_id',
	as: 'order'
});

OrderDetailMenu.belongsTo(OrderDetail, {
	foreignKey: 'order_detail_id',
	as: 'order_detail'
});

OrderDetail.hasOne(OrderDetailMenu, {
	foreignKey: 'order_detail_id',
	as: 'order_detail_menu'
});

OrderDetailMenu.belongsTo(Menu, {
	foreignKey: 'menu_id',
	as: 'menu'
});

Menu.hasMany(OrderDetailMenu, {
	foreignKey: 'menu_id',
	as: 'order_detail_menus'
});

// OrderDetail.belongsToMany(Menu, {
// 	through : OrderDetailMenu
// });

// OrderDetail.hasOne(Menu, {
// 	foreignKey: 'menu_id',
// 	as: 'menu'
// });

module.exports = OrderDetailMenu;