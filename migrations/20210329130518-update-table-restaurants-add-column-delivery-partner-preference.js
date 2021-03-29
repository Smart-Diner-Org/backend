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
	return db.addColumn('restaurant_branches', 'delivery_partner_preference_id', {
		type: 'bigint',
		notNull: false,
		foreignKey: {
			name: 'restaurants_delivery_partner_preference_id_fk',
			table: 'delivery_partner_preferences',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'	
			},
			mapping: 'id'
		}
	})
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
	return db.removeColumn('restaurant_branches', 'delivery_partner_preference_id');	
};

exports._meta = {
  "version": 1
};
