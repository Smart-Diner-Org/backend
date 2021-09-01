const Sequelize = require('sequelize');
var db = require('./../config/database');

const PushNotificationTokenStatus = db.define('push_notification_token_statuses', {
	name: {
		type: Sequelize.CHAR
	}
},{
	underscored: true
});

module.exports = PushNotificationTokenStatus;