const Sequelize = require('sequelize');
var db = require('./../config/database');
var Menu = require('./Menu');
var Restaurant = require('./Restaurant');

const RestaurantBranch = db.define('restaurant_branches', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	name: {
		type: Sequelize.CHAR
	},
	timings: {
		type: Sequelize.TEXT
	},
	address: {
		type: Sequelize.TEXT
	},
	g_location: {
		type: Sequelize.TEXT
	},
	city_id: {
		type: Sequelize.BIGINT
	},
	state_id: {
		type: Sequelize.BIGINT
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

RestaurantBranch.hasMany(Menu, {
	foreignKey: 'restuarant_branch_id',
	as: 'restaurant_branch_menu'
});
// RestaurantBranch.belongsTo(Restaurant);

module.exports = RestaurantBranch;