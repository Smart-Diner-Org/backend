const Sequelize = require('sequelize');
var db = require('./../config/database');

const Subscription = db.define('subscriptions', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	email: {
		type: Sequelize.STRING
	}
},{
	underscored: true
});

module.exports = Subscription;