const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var DeliveryPartner = require('./DeliveryPartner');
var Order = require('./Order');
var DeliveryRequest = require('./DeliveryRequest');

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

Customer.hasMany(DeliveryRequest, {
	foreignKey: 'delivery_person_id',
	as: 'delivery_requests'
});

DeliveryRequest.belongsTo(Customer, {
	foreignKey: 'delivery_person_id',
	as: 'delivery_person'
});

Order.hasMany(DeliveryRequest, {
	foreignKey: 'order_id',
	as: 'delivery_requests'
});

DeliveryRequest.belongsTo(Order, {
	foreignKey: 'order_id',
	as: 'delivery_order'
});



module.exports = DeliveryPersonPartnerAssociation;