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
	return db.changeColumn('payments', 'restaurant_payment_gateway_id', { notNull: true })
	.then(
		function(result3) {
		return true;
	},
	function(err3) {
		console.log("Error Occured 1...");
		console.log(err3);
		return;
	}
	);
};

exports.down = function(db) {
	return db.changeColumn('payments', 'restaurant_payment_gateway_id', { notNull: false })
};

exports._meta = {
  "version": 1
};
