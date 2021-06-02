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
	return db
		.addColumn(
			"order_details", "gst", { type: 'decimal', notNull: false }
		)
		.then(
		function (result) {
			return db
			.addColumn(
				"order_details", "price_includes_gst", { type: 'boolean', notNull: false }
			)
			.then(
				function (result) {
					return true;
				},
				function (err) {
					console.log("Error Occured...");
					console.log(err);
					return;
				}
			);
		},
		function (err) {
			console.log("Error Occured...");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	db.removeColumn("order_details", "price_includes_gst");
	return db.removeColumn("order_details", "gst");
};

exports._meta = {
  "version": 1
};
