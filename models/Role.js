const Sequelize = require('sequelize');
var db = require('./../config/database');
var Customer = require('./Customer');

const Role = db.define('roles', {
	name: {
		type: Sequelize.CHAR
	},
	is_active: {
		type: Sequelize.BOOLEAN
	}
},{
	underscored: true
});

// Role.hasMany(Customer, {
// 	foreignKey: 'role_id',
// 	as: 'role'
// });

module.exports = Role;