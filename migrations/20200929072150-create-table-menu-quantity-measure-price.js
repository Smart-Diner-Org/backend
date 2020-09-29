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
	return db.createTable('menu_quantity_measure_prices', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		menu_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'menu_quantity_measure_price_menu_id_fk',
				table: 'menus',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		quantity_value_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'menu_quantity_measure_price_quantity_id_fk',
				table: 'quantity_values',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		measure_value_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'menu_quantity_measure_price_measure_id_fk',
				table: 'measure_values',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		price: {
			type: 'decimal',
			notNull: true
		},
		display_order: {
			type: 'int'
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	});
};

exports.down = function(db) {
	return db.dropTable('menu_quantity_measure_prices');
};

exports._meta = {
  "version": 1
};
