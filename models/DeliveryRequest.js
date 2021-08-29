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
	},
	delivery_type: {
		type: Sequelize.BIGINT
	},
	scheduled_data_time: {
		type: Sequelize.DATE
	},
	request_id: {
      type: Sequelize.TEXT
  	},
  	referrence_id: {
      type: Sequelize.TEXT
  	},
  	task_id: {
      type: Sequelize.TEXT
  	},
  	pick_up_details: {
      type: Sequelize.JSON
  	},
  	drop_details: {
      type: Sequelize.JSON
  	}
},{
	// timestamps: false
	underscored: true
});

module.exports = DeliveryRequest;