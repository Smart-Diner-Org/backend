const Sequelize = require('sequelize');
var db = require('./../config/database');

const GetLocationType = db.define('get_location_types', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = GetLocationType;