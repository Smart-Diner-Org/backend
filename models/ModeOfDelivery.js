const Sequelize = require('sequelize');
var db = require('./../config/database');

const ModeOfDelivery = db.define('mode_of_deliveries', {
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

module.exports = ModeOfDelivery;