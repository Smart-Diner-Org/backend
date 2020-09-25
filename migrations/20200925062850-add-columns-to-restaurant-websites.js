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
	return db.addColumn('restaurant_website_details', 'ga_tracking_id', 'text')
	.then(
		function(result) {
			return db.addColumn('restaurant_website_details', 'about_image', 'text')
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
		},
		function(err) {
			console.log("Error Occured...");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	db.removeColumn('restaurant_website_details', 'ga_tracking_id');
	return db.removeColumn('restaurant_website_details', 'about_image');
};

exports._meta = {
  "version": 1
};
