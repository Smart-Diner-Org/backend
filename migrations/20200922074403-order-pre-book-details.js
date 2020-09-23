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
	return db.createTable('order_pre_book_details', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		order_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'order_pre_book_details_order_id_fk',
				table: 'orders',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		date_of_delivery: {
			type: 'date',
			notNull: true
		},
		time_of_delivery: {
			type: 'time'
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	}).then(
		function(result) {
			return true;
		},
		function(err) {
			return;
		}
	);
};

exports.down = function(db) {
	return db.dropTable('order_pre_book_details');
};

exports._meta = {
  "version": 1
};
