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
	var paymentTypes = [
		['Cash On Delivery'],
		['Online Payment']
	];
	return db.createTable('payment_types', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: 'string',
			notNull: true,
			unique: true
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	})
	.then(
		function(result) {
			for(const index in paymentTypes) {
				db.insert('payment_types', ['name'], paymentTypes[index]);
			}
			return true;
		},
		function(err) {
			console.log("error");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	return db.dropTable('payment_types');
};

exports._meta = {
  "version": 1
};
