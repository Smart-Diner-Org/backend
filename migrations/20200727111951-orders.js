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
	return db.createTable('orders', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		customer_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'order_customer_id_fk',
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
				name: 'order_branch_id_fk',
				table: 'restaurant_branches',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		description: 'text',
		total_price: {
			type: 'decimal',
			notNull: true
		},
		stage_id: {
			type: 'bigint',
			foreignKey: {
				name: 'order_stage_id_fk',
				table: 'order_stages',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		payment_status_id: {
			type: 'bigint',
			foreignKey: {
				name: 'order_payment_status_id_fk',
				table: 'payment_statuses',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		mode_of_delivery_id: {
			type: 'bigint',
			foreignKey: {
				name: 'order_mode_of_delivery_id_fk',
				table: 'mode_of_deliveries',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		delivery_address: {
			type: 'text',
			notNull: true
		},
		delivery_g_location: {
			type: 'text'
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
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
	return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
