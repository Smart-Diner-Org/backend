const Sequelize = require('sequelize');
var db = require('./../config/database');

const DeliveryPartnerPreference = db.define('delivery_partner_preferences', {
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

module.exports = DeliveryPartnerPreference;