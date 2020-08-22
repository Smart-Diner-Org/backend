const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');
var RestaurantBranch = require('./RestaurantBranch');

const RestaurantEmployee = db.define('restaurant_employees', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	restuarant_branch_id: {
		type: Sequelize.BIGINT
	},
	status: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

RestaurantEmployee.belongsTo(Customer, {
	foreignKey: 'customer_id',
	as: 'customer'
});
RestaurantEmployee.belongsTo(RestaurantBranch, {
	foreignKey: 'restuarant_branch_id',
	as: 'restaurant_branch'
});

module.exports = RestaurantEmployee;