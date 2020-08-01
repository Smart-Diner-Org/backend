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
	return db.createTable('order_details', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		order_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'order_detail_order_id_fk',
				table: 'orders',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		menu_id: {
			type: 'bigint',
			foreignKey: {
				name: 'order_detail_menu_id_fk',
				table: 'menus',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		quantity: {
			type: 'int',
			notNull: true
		},
		price: {
			type: 'decimal',
			notNull: true
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
	return db.dropTable('order_details');
};

exports._meta = {
  "version": 1
};
