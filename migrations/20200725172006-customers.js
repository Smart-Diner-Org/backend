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
	return db.createTable('customers', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true,
		},
		name: { type: 'string'},
		email: { type: 'string' },
		mobile: { type: 'string', notNull: true, unique: true },
		password: { type: 'string' },
		role_id: {
			type: 'bigint',
			notNull: true,
			foreignKey:{
				name: 'customer_role_id_fk',
				table: 'roles',
				rules: {
					onDelete: 'CASCADE',
					onUpdate: 'RESTRICT'
				},
				mapping: 'id'
			}
		},
		mobile_verification: { type: 'boolean', defaultValue: false, notNull: true },
		remember_token: { type: 'string' },
		otp_secret: { type: 'string'},
		uuid: { type: 'string'},
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
  return db.dropTable('customers');
};

exports._meta = {
  "version": 1
};
