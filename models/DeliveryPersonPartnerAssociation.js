const Sequelize = require('sequelize');
var db = require('./../config/database');

const DeliveryPersonPartnerAssociation = db.define('delivery_person_partner_associations', {
	delivery_person_id: {
		type: Sequelize.BIGINT
	},
	delivery_partner_id: {
		type: Sequelize.BIGINT
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = DeliveryPersonPartnerAssociation;