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
	return db.createTable('delivery_requests', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		order_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'delivery_requests_order_id_fk',
				table: 'orders',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		delivery_person_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'delivery_requests_delivery_person_id_fk',
				table: 'customers',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		delivery_stage_id: {
			type: 'bigint',
			notNull: true,
			foreignKey: {
				name: 'delivery_requests_delivery_stage_id_fk',
				table: 'delivery_stages',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'	
				},
				mapping: 'id'
			}
		},
		notes: {
			type: 'text'
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
	return db.dropTable('delivery_person_partner_associations');
};

exports._meta = {
  "version": 1
};
