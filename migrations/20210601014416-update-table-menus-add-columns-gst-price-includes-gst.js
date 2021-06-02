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
			"menus", "gst", { type: 'decimal', notNull: false }
		)
		.then(
		function (result) {
			return db
			.addColumn(
				"menus", "price_includes_gst", { type: 'boolean', notNull: false }
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
	db.removeColumn("menus", "price_includes_gst");
	return db.removeColumn("menus", "gst");
};

exports._meta = {
  "version": 1
};
