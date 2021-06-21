const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const operatorsAliases = {
	$like: Op.like,
	$not: Op.not
}

module.exports = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: process.env.SEQUELIZE_DIALECT,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	$like: Op.like,
  	$not: Op.not
});

// Or you can simply use a connection uri
// var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');