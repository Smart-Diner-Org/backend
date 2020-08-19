const Sequelize = require('sequelize');
var db = require('./../config/database');

const ContactRequest = db.define('contact_requests', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	name: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	message: {
		type: Sequelize.TEXT
	}
},{
	underscored: true
});

module.exports = ContactRequest;