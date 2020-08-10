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
	return db.createTable('order_details_menus', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		order_detail_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'order_detail_id_fk',
				table: 'order_details',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		menu_id: {
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
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	}).then(
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
	return db.dropTable('order_details_menus');
};

exports._meta = {
  "version": 1
};
