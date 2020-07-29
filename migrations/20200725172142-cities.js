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
	var cities = [
		['Coimbatore', true],
		['Chennai', true],
		['Bangalore', true],
		['Tirupur', true],
		['Mysore', true],
		['Mumbai', true],
		['Pune', true]
	];
	return db.createTable('cities', {
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
		for(const index in cities) {  
			db.insert('cities', ['name', 'is_active'], cities[index]);
		}
		return;
	},
    function(err) {
		return;
    }
	);
};

exports.down = function(db) {
  return db.dropTable('cities');
};

exports._meta = {
  "version": 1
};
