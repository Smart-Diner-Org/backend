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
	return db.createTable('restaurants', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		customer_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_customer_id_pk',
				table: 'customers',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		template_id: {
			type: 'bigint',
			foreignKey: {
				name: 'restaurant_template_id_pk',
				table: 'templates',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		name: { type: 'string', notNull: true },
		logo: 'string',
		tracker_enabled: { type: 'boolean', notNull: true },
		status: { type: 'boolean', notNull: true, defaultValue: true },
		created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	}).then(
		function(result) {
			return true;
		},
		function(err) {
			return;
		}
	);
};

exports.down = function(db) {
  return db.dropTable('restaurants');
};

exports._meta = {
  "version": 1
};
