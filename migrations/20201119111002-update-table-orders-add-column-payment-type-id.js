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
	return db.addColumn('orders', 'payment_type_id', {
		type: 'bigint',
		notNull: true,
		foreignKey: {
			name: 'orders_payment_type_id_fk',
			table: 'payment_types',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'
			},
			mapping: 'id'
		}
	})
	.then(
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
	return db.removeColumn('orders', 'payment_type_id');
};

exports._meta = {
  "version": 1
};
