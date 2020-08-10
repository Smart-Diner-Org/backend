const Sequelize = require('sequelize');
var db = require('./../config/database');
var City = require('./City');
var State = require('./State');
var Customer = require('./Customer');

const CustomerDetail = db.define('customer_details', {
	customer_id: {
		type: Sequelize.BIGINT
	},
	address: {
		type: Sequelize.TEXT
	},
	city_id: {
		type: Sequelize.BIGINT
	},
	state_id: {
		type: Sequelize.BIGINT
	},
	primary: {
		type: Sequelize.BOOLEAN
	},
	address_type: {
		type: Sequelize.BIGINT
	},
	lat: {
		type: Sequelize.DECIMAL
	},
	long: {
		type: Sequelize.DECIMAL
	}
},{
	underscored: true
});

CustomerDetail.belongsTo(City, {
	foreignKey: 'city_id',
	as: 'city'
});

CustomerDetail.belongsTo(State, {
	foreignKey: 'state_id',
	as: 'state'
});

// CustomerDetail.belongsTo(Customer, {
// 	foreignKey: 'customer_id',
// 	as: 'customer'
// });

module.exports = CustomerDetail;