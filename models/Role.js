const Sequelize = require('sequelize');
var db = require('./../config/database');

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

// Restaurant.belongsTo(Role, {
// 	foreignKey: 'role_id',
// 	as: 'role'
// });

module.exports = Role;