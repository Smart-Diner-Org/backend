const Sequelize = require('sequelize');
var db = require('./../config/database');

const GetLocationPlace = db.define('get_location_places', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = GetLocationPlace;