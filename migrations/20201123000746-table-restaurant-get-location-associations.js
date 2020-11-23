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
	return db.createTable('restaurant_get_location_associations', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		get_location_type_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_get_location_association_get_location_type_id_fk',
				table: 'get_location_types',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		get_location_place_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_get_location_association_get_location_place_id_fk',
				table: 'get_location_places',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		restaurant_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_get_location_association_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		is_location_check_enabled: {
			type: 'boolean',
			notNull: true,
			defaultValue: true
		},
		status: {
			type: 'boolean',
			notNull: true,
			defaultValue: true
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
	return db.dropTable('restaurant_get_location_associations');
};

exports._meta = {
  "version": 1
};
