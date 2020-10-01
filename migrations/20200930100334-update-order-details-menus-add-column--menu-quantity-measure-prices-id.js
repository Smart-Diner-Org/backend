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
	return db.addColumn('order_details_menus', 'menu_quantity_measure_price_id', {
		type: 'bigint',
		notNull: true,
		foreignKey:{
			name: 'order_details_menu_menu_quantity_measure_price_id_fk',
			table: 'menu_quantity_measure_prices',
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
 	return db.removeColumn('order_details_menus', 'menu_quantity_measure_price_id');
};

exports._meta = {
  "version": 1
};
