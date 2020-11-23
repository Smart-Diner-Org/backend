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
	var getLocationTypes = [
		['Google Location'],
		['Dropdown Location']
	];
	return db.createTable('get_location_types', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: 'string',
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
			for(const index in getLocationTypes) {
				db.insert('get_location_types', ['name'], getLocationTypes[index]);
			}
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
	return db.dropTable('get_location_types');
};

exports._meta = {
  "version": 1
};
