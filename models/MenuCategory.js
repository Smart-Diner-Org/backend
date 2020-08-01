const Sequelize = require('sequelize');
var db = require('./../config/database');
var Menu = require('./Menu');

const MenuCategory = db.define('menu_categories', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

// MenuCategory.hasMany(Menu, {
// 	as: 'menus',
// 	foreignKey: 'category_id'
// });

module.exports = MenuCategory;