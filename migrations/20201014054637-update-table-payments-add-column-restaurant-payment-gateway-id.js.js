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
	return db.addColumn('payments', 'restaurant_payment_gateway_id', {
		type: 'bigint',
		foreignKey: {
			name: 'payments_restaurant_payment_gateway_id_fk',
			table: 'restaurant_payment_gateways',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'
			},
			mapping: 'id'
		}
	})
	.then(
		function(result) {
			db.runSql('update payments set restaurant_payment_gateway_id=1;')
			.then(
				function(result2) {
					return true;
				},
				function(err2) {
					console.log("Error Occured 2...");
					console.log(err2);
					return;
				}
			);
		},
		function(err) {
			console.log("Error Occured 3...");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	return db.removeColumn('payments', 'restaurant_payment_gateway_id');
};

exports._meta = {
  "version": 1
};
