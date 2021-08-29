const Sequelize = require('sequelize');
var db = require('./../config/database');

const PushNotificationToken = db.define('push_notification_tokens', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	token: {
		type: Sequelize.TEXT
	},
	token_status: {
		type: Sequelize.BIGINT
	},
	token_timestamp: {
		type: Sequelize.DATE
	}
},{
	underscored: true
});

module.exports = PushNotificationToken;