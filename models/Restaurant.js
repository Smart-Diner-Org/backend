const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var RestaurantDetail = require('./RestaurantDetail');
var RestaurantBranch = require('./RestaurantBranch');
var RestaurantWebsiteDetail = require('./RestaurantWebsiteDetail');
var RestaurantPaymentGateway = require('./RestaurantPaymentGateway');

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
Restaurant.hasOne(RestaurantWebsiteDetail, {
	foreignKey: 'restaurant_id',
	as: 'restaurant_website_detail'
});
RestaurantWebsiteDetail.belongsTo(Restaurant, {
	foreignKey: 'restaurant_id',
	as: 'restaurant'
});

Restaurant.hasMany(RestaurantPaymentGateway, {
	foreignKey: 'restaurant_id',
	as: 'restaurant_payments_gateways'
});
RestaurantPaymentGateway.belongsTo(Restaurant, {
	foreignKey: 'restaurant_id',
	as: 'restaurant'
});

module.exports = Restaurant;