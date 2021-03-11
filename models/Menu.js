const Sequelize = require('sequelize');
var db = require('./../config/database');
var MenuCategory = require('./MenuCategory');
var MenuQuantityMeasurePrice = require('./MenuQuantityMeasurePrice');
var QuantityValue = require('./QuantityValue');
var MeasureValue = require('./MeasureValue');
var RestaurantMenuCategorySequence = require('./RestaurantMenuCategorySequence');

const Menu = db.define('menus', {
	restuarant_branch_id: {
		type: Sequelize.BIGINT
	},
	category_id: {
		type: Sequelize.BIGINT
	},
	name: {
		type: Sequelize.CHAR
	},
	status: {
		type: Sequelize.BOOLEAN
	},
	description: {
		type: Sequelize.TEXT
	},
	short_description: {
		type: Sequelize.TEXT
	},
	image: {
		type: Sequelize.TEXT
	},
	price: {
		type: Sequelize.DECIMAL
	},
	serving: {
		type: Sequelize.INTEGER
	},
	discount: {
		type: Sequelize.DECIMAL
	},
	menu_type: {
		type: Sequelize.BIGINT
	},
	coupon_valid: {
		type: Sequelize.BOOLEAN
	},
	serving_measure: {
		type: Sequelize.STRING
	},
	is_available: {
		type: Sequelize.BOOLEAN
	}
	// created_at: {
	// 	type: Sequelize.NOW
	// },
	// updated_at: {
	// 	type: Sequelize.NOW
	// }
},{
	// timestamps: false
	underscored: true
});

Menu.belongsTo(MenuCategory, {
	foreignKey: 'category_id',
	as: 'category'
});

MenuCategory.hasMany(Menu, {
	foreignKey: 'category_id',
	as: 'menus'
});

RestaurantMenuCategorySequence.belongsTo(MenuCategory, {
	foreignKey: 'category_id',
	as: 'category'
});

MenuCategory.hasMany(RestaurantMenuCategorySequence, {
	foreignKey: 'category_id',
	as: 'restaurant_sequences'
});

Menu.hasMany(MenuQuantityMeasurePrice, {
	foreignKey: 'menu_id',
	as: 'menu_quantity_measure_price_list'
});

MenuQuantityMeasurePrice.belongsTo(Menu, {
	foreignKey: 'menu_id',
	as: 'menu'
});

MenuQuantityMeasurePrice.belongsTo(QuantityValue, {
	foreignKey: 'quantity_value_id',
	as: 'quantity_values'
});

MenuQuantityMeasurePrice.belongsTo(MeasureValue, {
	foreignKey: 'measure_value_id',
	as: 'measure_values'
});


module.exports = Menu;