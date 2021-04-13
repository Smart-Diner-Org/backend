const Sequelize = require('sequelize');
var db = require('./../config/database');

const DeliveryStage = db.define('delivery_stages', {
	name: {
		type: Sequelize.STRING
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = DeliveryStage;