const Sequelize = require('sequelize');
var db = require('./../database/config');

const Menu = db.define('menus', {
	restuarant_branch_id: {
		type: Sequelize.BIGINT
	},
	category_id: {
		type: Sequelize.BIGINT
	},
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	},
	description: {
		type: Sequelize.TEXT
	},
	image: {
		type: Sequelize.TEXT
	},
	price: {
		type: Sequelize.DECIMAL
	},
	serving: {
		type: Sequelize.INTEGER
	},
	discount: {
		type: Sequelize.DECIMAL
	},
	menu_type: {
		type: Sequelize.BIGINT
	},
	coupon_valid: {
		type: Sequelize.BOOLEAN
	},
	// created_at: {
	// 	type: Sequelize.NOW
	// },
	// updated_at: {
	// 	type: Sequelize.NOW
	// }
},{
	// timestamps: false
})

module.exports = Menu;