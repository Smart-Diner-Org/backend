const Sequelize = require('sequelize');
var db = require('./../config/database');

const State = db.define('states', {
	name: {
		type: Sequelize.CHAR
	},
	is_active: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = State;