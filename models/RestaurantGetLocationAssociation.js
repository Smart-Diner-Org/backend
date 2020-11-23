const Sequelize = require('sequelize');
var db = require('./../config/database');
var GetLocationType = require('./GetLocationType');
var GetLocationPlace = require('./GetLocationPlace');

const RestaurantGetLocationAssociation = db.define('restaurant_get_location_associations', {
	get_location_type_id: {
		type: Sequelize.BIGINT
	},
	get_location_place_id: {
		type: Sequelize.BIGINT
	},
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	is_location_check_enabled: {
		type: Sequelize.BOOLEAN
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

RestaurantGetLocationAssociation.belongsTo(GetLocationType, {
	foreignKey: 'get_location_type_id',
	as: 'get_location_type'
});
RestaurantGetLocationAssociation.belongsTo(GetLocationPlace, {
	foreignKey: 'get_location_place_id',
	as: 'get_location_place'
});

module.exports = RestaurantGetLocationAssociation;