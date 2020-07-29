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
  var states = [
		['Tamil Nadu', true],
		['Karnataka', true],
		['Andhra Pradesh', true],
		['Telangana', true],
		['Maharashtra', true],
		['Kerala', true]
	];
	return db.createTable('states', {
	  	id: {
	  		type: 'bigint',
	  		primaryKey : true,
	  		autoIncrement: true
	  	},
		name: { type: 'string', notNull: true },
		is_active: { type: 'boolean', defaultValue: true, notNull: true},
		createdAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
		updatedAt: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
	})
	.then(
  	function(result) {
		for(const index in states) {  
			db.insert('states', ['name', 'is_active'], states[index]);
		}
		return;
	},
    function(err) {
		return;
    }
	);
};

exports.down = function(db) {
  return db.dropTable('states');
};

exports._meta = {
  "version": 1
};
