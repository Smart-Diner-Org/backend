const Sequelize = require('sequelize');
var db = require('./../config/database');

const CancellationReason = db.define('cancellation_reasons', {
	reason: {
		type: Sequelize.BIGINT
	},
	type: {
		type: Sequelize.TEXT
	},
	status: {
		type: Sequelize.STRING
	}
},{
	underscored: true
});

module.exports = CancellationReason;