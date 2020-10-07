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
	return db.addColumn('payments', 'payment_gateway_id', {
		type: 'bigint',
		// notNull: true,
		foreignKey: {
			name: 'payments_payment_gateway_id_fk',
			table: 'payment_gateways',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'
			},
			mapping: 'id'
		}
	})
	.then(
		function(result) {
			db.runSql('update payments set payment_gateway_id=1;')
			.then(
				function(result2) {
					db.changeColumn('payments', 'payment_gateway_id', { notNull: true })
					  	.then(
					  		function(result3) {
								return true;
							},
							function(err3) {
								console.log("Error Occured...");
								console.log(err3);
								return;
							}
					  	);
				},
				function(err2) {
					console.log("Error Occured...");
					console.log(err2);
					return;
				}
			);
		},
		function(err) {
			console.log("Error Occured...");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	return db.removeColumn('payments', 'payment_gateway_id');
};

exports._meta = {
  "version": 1
};
