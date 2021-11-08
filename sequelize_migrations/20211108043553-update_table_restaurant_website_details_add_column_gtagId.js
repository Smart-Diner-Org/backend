'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('restaurant_website_details', 'gtag_tracking_id', {
        type: Sequelize.TEXT,
        notNull: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurant_website_details',
        'gtag_tracking_id'
      )
    ]);
  }
};
