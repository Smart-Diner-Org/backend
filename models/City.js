const Sequelize = require('sequelize');
var db = require('./../config/database');

const City = db.define('cities', {
	name: {
		type: Sequelize.CHAR
	},
	is_active: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = City;