const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var PushNotificationTokenStatus = require('./PushNotificationTokenStatus');

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

PushNotificationToken.belongsTo(Customer, {
	foreignKey: 'customer_id',
	as: 'customer'
});
Customer.hasMany(PushNotificationTokenStatus, {
	foreignKey: 'customer_id',
	as: 'push_notification_tokens'
});

PushNotificationToken.belongsTo(PushNotificationTokenStatus, {
	foreignKey: 'token_status',
	as: 'push_notification_token_status'
});
PushNotificationTokenStatus.hasMany(PushNotificationToken, {
	foreignKey: 'token_status',
	as: 'push_notification_token'
});

module.exports = PushNotificationToken;