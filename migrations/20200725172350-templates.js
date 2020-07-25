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
  	return db.createTable('templates', {
	  	id: {
	  		type: 'bigint',
	  		primaryKey : true,
	  		autoIncrement: true
	  	},
		name: { type: 'string', notNull: true },
		content: { type: 'text'},
		status: { type: 'boolean', defaultValue: 1, notNull: true},
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
  return db.dropTable('templates');
};

exports._meta = {
  "version": 1
};
