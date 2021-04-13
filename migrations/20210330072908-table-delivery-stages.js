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
	var deliveryStages = [
		['Requested'],
		['Accepted'],
		['Rejected'],
		['Reassigned'],
		['Completed'],
		['Delayed'],
		['Undelivered']
	];
	return db.createTable('delivery_stages', {
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
			for(const index in deliveryStages) {
				db.insert('delivery_stages', ['name'], deliveryStages[index]);
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
	return db.dropTable('delivery_stages');
};

exports._meta = {
  "version": 1
};
