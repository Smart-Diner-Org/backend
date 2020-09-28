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
	return db.createTable('subscriptions', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restaurant_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'contact_requests_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		email: {
			type: 'string',
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
	return db.dropTable('subscriptions');
};

exports._meta = {
  "version": 1
};
