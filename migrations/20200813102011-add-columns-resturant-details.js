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
	return db.addColumn('restaurant_branches', 'contact_number', {type: 'string', notNull: true})
	.then(
		function(result) {
			return db.addColumn('restaurant_branches', 'email', {type: 'string'})
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
	db.removeColumn('restaurant_branches', 'contact_number');
	return db.removeColumn('restaurant_branches', 'email');
};

exports._meta = {
  "version": 1
};
