'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
	return db.createTable('restaurant_employees', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		customer_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'restaurant_employee_customer_id_fk',
				table: 'customers',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		restuarant_branch_id: {
			type: 'bigint',
			foreignKey: {
				name: 'restaurant_employee_branch_id_fk',
				table: 'restaurant_branches',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		createdAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updatedAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	}).then(
		function(result) {
			return true;
		},
		function(err) {
			console.log("Error Occured...");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	return db.dropTable('restaurant_employees');
};

exports._meta = {
  "version": 1
};
