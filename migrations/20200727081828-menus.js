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
	return db.createTable('menus', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restuarant_branch_id: {
			type: 'bigint',
			foreignKey: {
				name: 'menu_restaurant_branch_id_fk',
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
			foreignKey: {
			name: 'menu_category_id_fk',
			table: 'menu_categories',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'	
			},
			mapping: 'id'
		}
		},
		name: {
			type: 'string',
			notNull: true
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		description: 'text',
		image: 'text',
		price: {
			type: 'decimal',
			notNull: true
		},
		serving: {
			type: 'int',
			notNull: true
		},
		discount: {
			type: 'decimal',
			notNull: true
		},
		menu_type: {
			type: 'bigint',
			foreignKey: {
			name: 'menu_type_id_fk',
			table: 'menu_types',
			rules: {
				onDelete: 'CASCADE',
				onUpdate: 'RESTRICT'	
			},
			mapping: 'id'
		}
		},
		coupon_valid: {
			type: 'boolean',
		defaultValue: true,
		notNull: true
		},
		createdAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updatedAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
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
  return db.dropTable('menus');
};

exports._meta = {
  "version": 1
};
