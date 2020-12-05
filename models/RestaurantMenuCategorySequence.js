const Sequelize = require('sequelize');
var db = require('./../config/database');
var Menu = require('./Menu');

const RestaurantMenuCategorySequence = db.define('restaurant_menu_category_sequences', {
	restuarant_branch_id: {
		type: Sequelize.BIGINT
	},
	category_id: {
		type: Sequelize.BIGINT
	},
	display_sequence: {
		type: Sequelize.INTEGER
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = RestaurantMenuCategorySequence;