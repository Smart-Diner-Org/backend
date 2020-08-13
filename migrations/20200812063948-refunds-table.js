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
	return db.createTable('refunds', {
		id: {
			type: 'bigint',
			primaryKey : true,
			autoIncrement: true
		},
		payment_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'refund_payment_id_fk',
				table: 'payments',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		transaction_id: { type: 'text', notNull: true },
		type: { type: 'string', notNull: true },
		body: { type: 'text' },
		status: { type: 'string', notNull: true },
		refund_id: { type: 'text' },
		refund_amount: { type: 'decimal', notNull: true },
		total_amount: { type: 'decimal', notNull: true },
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
	return db.dropTable('refunds');
};

exports._meta = {
  "version": 1
};
