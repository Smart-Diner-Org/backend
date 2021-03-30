const Sequelize = require('sequelize');
var db = require('./../config/database');

const DeliveryRequest = db.define('delivery_requests', {
	order_id: {
		type: Sequelize.BIGINT
	},
	delivery_person_id: {
		type: Sequelize.BIGINT
	},
	delivery_stage_id: {
		type: Sequelize.BIGINT
	},
	notes: {
		type: Sequelize.TEXT
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = DeliveryRequest;