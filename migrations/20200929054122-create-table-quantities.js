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
	var quantities = [
		['1/2'],
		['1'],
		['1.5'],
		['2'],
		['2.5'],
		['5'],
		['10'],
		['20'],
		['50'],
		['100'],
		['250'],
		['300'],
		['500'],
		['750']
	];
	return db.createTable('quantity_values', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		quantity: {
			type: 'string',
			notNull: true,
			unique: true
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
			for(const index in quantities) {  
				db.insert('quantity_values', ['quantity'], quantities[index]);
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
	return db.dropTable('quantity_values');
};

exports._meta = {
  "version": 1
};
