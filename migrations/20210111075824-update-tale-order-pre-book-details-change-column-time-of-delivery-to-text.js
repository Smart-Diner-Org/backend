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
	return db.changeColumn('order_pre_book_details', 'time_of_delivery', { type: 'string', notNull: true })
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
	return db.changeColumn('order_pre_book_details', 'time_of_delivery', { type: 'time', notNull: false });
};

exports._meta = {
  "version": 1
};
