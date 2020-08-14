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
	return db.createTable('restaurant_coupons', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restuarant_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_coupon_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		code: {
			type: 'int',
			notNull: true
		},
		min_purchase: {
			type: 'decimal',
			notNull: true
		},
		status: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		description: 'string',
		percentage: {
			type: 'int',
			notNull: true
		},
		discount_threshold_limit: {
			type: 'decimal',
			notNull: true
		},
		valid_till: {
			type: 'datetime',
			notNull: true
		},
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
	return db.dropTable('restaurant_coupons');
};

exports._meta = {
  "version": 1
};
