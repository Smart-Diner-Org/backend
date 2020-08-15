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
	return db.createTable('restaurant_branches', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restaurant_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_branches_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		name: {
			type: 'string',
			notNull: true,
		},
		timings: 'text',
		address: {
			type: 'text',
			notNull: true
		},
		g_location: {
			type: 'text'
		},
		city_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_branches_city_id_fk',
				table: 'cities',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		state_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_branches_state_id_fk',
				table: 'states',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		contact_number: {
			type: 'string',
			notNull: true
		},
		email: 'string',
		delivery_locations: 'text',
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
	return db.dropTable('restaurant_branches');
};

exports._meta = {
  "version": 1
};
