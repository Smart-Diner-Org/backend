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
	return db.addColumn('restaurant_branches', 'delivery_postal_codes', 'text')
  	.then(
		function(result) {
			return db.addColumn('restaurant_branches', 'delivery_distance', 'integer')
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
	db.removeColumn('restaurant_branches', 'delivery_postal_codes');
	return db.removeColumn('restaurant_branches', 'delivery_distance');
};

exports._meta = {
	"version": 1
};
