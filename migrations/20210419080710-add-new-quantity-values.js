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
	var values = [
		['quarter', true],
		['half', true],
		['full', true]
	];
	var index=0;
	function insertValues(){
		return db.insert('quantity_values', ['quantity', 'status'], values[index])
		.then(
			function (result) {
				index++;
				if(index < values.length){
					insertValues();
				}
				else return true;
			}
		);
	}
	return insertValues();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
