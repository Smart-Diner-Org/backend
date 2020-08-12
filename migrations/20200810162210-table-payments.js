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
	return db.createTable('payments', {
		id: {
			type: 'bigint',
			primaryKey : true,
			autoIncrement: true
		},
		order_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'payments_order_id_fk',
				table: 'orders',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		payment_request_id: { type: 'text', notNull: true },
		payment_id: { type: 'text' },
		purpose: { type: 'text', notNull: true },
		payment_request_status: { type: 'string', notNull: true },
		payment_status: { type: 'string' },
		payment_url_long: { type: 'text', notNull: true },
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	})
	.then(function(result) {
		return true;
	},
	function(err) {
		return;
	});
};

exports.down = function(db) {
	return db.dropTable('payments');
};

exports._meta = {
  "version": 1
};
