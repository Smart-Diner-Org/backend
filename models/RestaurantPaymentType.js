const Sequelize = require('sequelize');
var db = require('./../config/database');
var PaymentType = require('./PaymentType');

const RestaurantPaymentType = db.define('restaurant_payment_types', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	payment_type_id: {
		type: Sequelize.BIGINT
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

RestaurantPaymentType.belongsTo(PaymentType, {
	foreignKey: 'payment_type_id',
	as: 'payment_type'
});

module.exports = RestaurantPaymentType;