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
	var reasons = [
		['Non deliverable area', 'restaurant'],
		['Food is unavailable', 'restaurant'],
		['Duplicate order', 'restaurant'],
		['Not able to reach out the customer', 'restaurant'],
		['Payment pending', 'restaurant'],
		['Request from cutomer', 'restaurant'],
		['Technical issues', 'restaurant'],
		['Others', 'restaurant'],
		['Changed my mind (No need for food)', 'customer'],
		['Delay in delivery', 'customer'],
		['No response from the restaurant', 'customer'],
		['Wrongly selected the food items while ordering', 'customer'],
		['Others', 'customer']
	];
	return db.createTable('cancellation_reasons', {
		id: {
			type: 'bigint',
			primaryKey: true,
			autoIncrement: true
		},
		reason: {
			type: 'text',
			notNull: true
		},
		type: {
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
			for(const index in reasons) {  
				db.insert('cancellation_reasons', ['reason', 'type'], reasons[index]);
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
	return db.dropTable('cancellation_reasons');
};

exports._meta = {
  "version": 1
};
