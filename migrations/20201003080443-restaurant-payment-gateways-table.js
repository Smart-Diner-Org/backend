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
	return db.createTable('restaurant_payment_gateways', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		restaurant_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_payment_gateways_restaurant_id_fk',
				table: 'restaurants',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		payment_gateway_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'restaurant_payment_gateways_gateway_id_fk',
				table: 'payment_gateways',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		api_key: {
			type: 'text',
			notNull: true
		},
		auth_token: {
			type: 'text',
			notNull: true
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
			console.log("error");
			console.log(err);
			return;
		}
	);
};

exports.down = function(db) {
	return db.dropTable('restaurant_payment_gateways');
};

exports._meta = {
  "version": 1
};
