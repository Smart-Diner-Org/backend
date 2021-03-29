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
	return db.addColumn('orders', 'delivery_person_id', {
		type: 'bigint',
		notNull: false,
		foreignKey: {
			name: 'orders_delivery_person_id_fk',
			table: 'customers',
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
	return db.removeColumn('orders', 'delivery_person_id');	
};

exports._meta = {
  "version": 1
};
