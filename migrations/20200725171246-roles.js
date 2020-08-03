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
  var values = [['Super Admin', true], ['Admin', true], ['Delivery Agent', true], ['Customer', true]];
  return db.createTable('roles', {
  	id: {
  		type: 'bigint',
  		primaryKey : true,
  		autoIncrement: true
  	},
  	name: { type: 'string', notNull: true },
  	is_active: { type: 'boolean', defaultValue: true, notNull: true},
  	created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
  	updated_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
  })
  .then(
  	function(result) {
		for(const index in values) {  
			db.insert('roles', ['name', 'is_active'], values[index]);
		}
		return;
	},
    function(err) {
      return;
    }
  )
  // .then(
  //   function(result) {
  //     return db.insert('roles', ['name', 'is_active'], ['admin', true]);
  //   },
  //   function(err) {
  //     return;
  //   }
  // )
  ;
};

exports.down = function(db) {
  return db.dropTable('roles');;
};

exports._meta = {
  "version": 1
};
