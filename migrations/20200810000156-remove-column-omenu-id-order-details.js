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
	return db.removeColumn('order_details', 'menu_id')
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
	return db.addColumn('order_details', 'menu_id', {
		type: 'bigint',
		foreignKey: {
			name: 'order_detail_menu_id_fk',
			table: 'menus',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'	
			},
			mapping: 'id'
		}
	});
};

exports._meta = {
  "version": 1
};
