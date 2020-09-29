const Sequelize = require('sequelize');
var db = require('./../config/database');

const QuantityValue = db.define('quantity_values', {
	quantity: {
		type: Sequelize.STRING
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = QuantityValue;