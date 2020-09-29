const Sequelize = require('sequelize');
var db = require('./../config/database');

const MeasureValue = db.define('measure_values', {
	name: {
		type: Sequelize.STRING
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = MeasureValue;