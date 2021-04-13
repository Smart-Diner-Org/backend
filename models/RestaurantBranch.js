const Sequelize = require('sequelize');
var db = require('./../config/database');
var Menu = require('./Menu');
var Restaurant = require('./Restaurant');
var DeliveryPartnerPreference = require('./DeliveryPartnerPreference');

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
	},
	long: {
		type: Sequelize.DECIMAL
	},
	lat: {
		type: Sequelize.DECIMAL
	},
	email: {
		type: Sequelize.CHAR
	},
	contact_number: {
		type: Sequelize.CHAR
	},
	delivery_locations: {
		type: Sequelize.TEXT
	},
	delivery_postal_codes: {
		type: Sequelize.TEXT
	},
	delivery_distance: {
		type: Sequelize.INTEGER
	},
	delivery_locations_to_display: {
		type: Sequelize.TEXT
	},
	delivery_slots: {
		type: Sequelize.TEXT
	}
},{
	underscored: true
});

RestaurantBranch.hasMany(Menu, {
	foreignKey: 'restuarant_branch_id',
	as: 'restaurant_branch_menu'
});

RestaurantBranch.hasOne(DeliveryPartnerPreference, {
	foreignKey: 'delivery_partner_preference_id',
	as: 'delivery_partner_preference'
});

module.exports = RestaurantBranch;