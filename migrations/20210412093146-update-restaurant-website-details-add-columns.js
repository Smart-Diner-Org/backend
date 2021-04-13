"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db
    .addColumn("restaurant_website_details", "should_calculate_gst", { type: 'boolean', notNull: true, defaultValue: false })
    .then(
      function (result) {
        return db
          .addColumn(
            "restaurant_website_details",
            "min_purchase_amount",
            { type: 'numeric', notNull: true, defaultValue: 0 }
          )
          .then(
            function (result) {
              // TODO: default_delivery_charge inclusion is for temporary purpose. 
              // In future, while we are implementing the proper calculation we may need to remove it.
              return db
                .addColumn(
                  "restaurant_website_details",
                  "default_delivery_charge",
                  { type: 'numeric', notNull: true, defaultValue: 0 }
                )
                .then(
                  function (result) {
                    return true;
                  },
                  function (err) {
                    console.log("Error Occured...");
                    console.log(err);
                    return;
                  }
                );
            },
            function (err) {
              console.log("Error Occured...");
              console.log(err);
              return;
            }
          );
      },
      function (err) {
        console.log("Error Occured...");
        console.log(err);
        return;
      }
    );
};

exports.down = function (db) {
  db.removeColumn("restaurant_website_details", "should_calculate_gst");
  db.removeColumn("restaurant_website_details", "min_purchase_amount");
  return db.removeColumn("restaurant_website_details", "default_delivery_charge");
};

exports._meta = {
  version: 1,
};
