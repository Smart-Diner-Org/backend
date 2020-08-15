const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var RestaurantDetail = require('./RestaurantDetail');
var RestaurantBranch = require('./RestaurantBranch');

const Restaurant = db.define('restaurants', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	template_id: {
		type: Sequelize.BIGINT
	},
	name: {
		type: Sequelize.CHAR
	},
	logo: {
		type: Sequelize.CHAR
	},
	tracker_enabled: {
		type: Sequelize.BOOLEAN
	},
	status: {
		type: Sequelize.BOOLEAN
	},
	url: {
		type: Sequelize.CHAR
	},
	about: {
		type: Sequelize.TEXT
	}
},{
	underscored: true
});

Restaurant.belongsTo(Customer, {
	foreignKey: 'customer_id',
	as: 'customer'
});

Restaurant.hasOne(RestaurantDetail, {
	foreignKey: 'restaurant_id',
	as: 'restaurant_detail'
});

Restaurant.hasMany(RestaurantBranch, {
	foreignKey: 'restaurant_id',
	as: 'restaurant_branches'
});
RestaurantBranch.belongsTo(Restaurant, {
	foreignKey: 'restaurant_id',
	as: 'restaurant'
});

module.exports = Restaurant;