const Sequelize = require('sequelize');
var db = require('./../config/database');

const DeliveryPartner = db.define('delivery_partners', {
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

module.exports = DeliveryPartner;