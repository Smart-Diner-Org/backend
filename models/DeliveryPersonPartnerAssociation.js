const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var DeliveryPartner = require('./DeliveryPartner');

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

DeliveryPersonPartnerAssociation.belongsTo(Customer, {
	foreignKey: 'delivery_person_id',
	as: 'delivery_person'
});
Customer.hasOne(DeliveryPersonPartnerAssociation, {
	foreignKey: 'delivery_person_id',
	as: 'delivery_partner_association'
});

DeliveryPersonPartnerAssociation.belongsTo(DeliveryPartner, {
	foreignKey: 'delivery_partner_id',
	as: 'delivery_partner'
});
DeliveryPartner.hasOne(DeliveryPersonPartnerAssociation, {
	foreignKey: 'delivery_partner_id',
	as: 'delivery_person_association'
});

module.exports = DeliveryPersonPartnerAssociation;