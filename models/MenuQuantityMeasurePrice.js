const Sequelize = require('sequelize');
var db = require('./../config/database');

const MenuQuantityMeasurePrice = db.define('menu_quantity_measure_prices', {
	menu_id: {
		type: Sequelize.BIGINT
	},
	quantity_value_id: {
		type: Sequelize.BIGINT
	},
	measure_value_id: {
		type: Sequelize.BIGINT
	},
	price: {
		type: Sequelize.DECIMAL
	},
	display_order: {
		type: Sequelize.INTEGER
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	// timestamps: false
	underscored: true
});

module.exports = MenuQuantityMeasurePrice;