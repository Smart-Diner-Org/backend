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
	return db.createTable('restaurant_menu_category_sequences', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restuarant_branch_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_menu_category_sequence_restaurant_branch_id_fk',
				table: 'restaurant_branches',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		category_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_menu_category_sequence_category_id_fk',
				table: 'menu_categories',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		display_sequence: {
			type: 'int'
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	})
	.then(
		function(result) {
			return true;
		},
		function(err) {
			return;
		}
	);
};

exports.down = function(db) {
	return db.dropTable('restaurant_menu_category_sequences');
};

exports._meta = {
  "version": 1
};
