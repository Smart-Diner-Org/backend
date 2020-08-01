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
	return db.createTable('customer_details', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		customer_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'customer_detail_customer_id_fk',
				table: 'customers',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		address: {
			type: 'text',
			notNull: true
		},
		city_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'customer_detail_city_id_fk',
				table: 'cities',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		state_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'customer_detail_state_id_fk',
				table: 'states',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		primary: { type: 'boolean', defaultValue: true },
		address_type: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'customer_detail_address_type_id_fk',
				table: 'address_types',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	})
	.then(
		function(result) {
			return true;
		},
		function(err) {
			return;
		}
	);
};

exports.down = function(db) {
  return db.dropTable('customer_details');
};

exports._meta = {
  "version": 1
};
