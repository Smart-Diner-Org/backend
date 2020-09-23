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
	return db.createTable('restaurant_website_details', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restaurant_id: {
			type: 'bigint',
			notNull: true,
			unique: true,
			foreignKey: {
				name: 'restaurant_website_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		is_pre_booking_enabled: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		is_pre_booking_time_required: {
			type: 'boolean',
			defaultValue: false,
			notNull: true
		},
		is_pick_my_location_enabled: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		is_payment_gateway_enabled: {
			type: 'boolean',
			defaultValue: true,
			notNull: true
		},
		is_cod_enabled: {
			type: 'boolean',
			defaultValue: false,
			notNull: true
		},
		page_description: {
			type: 'text'
		},
		slider_images: { // comma separated values
			type: 'text'
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
	return db.dropTable('restaurant_website_details');
};

exports._meta = {
  "version": 1
};
