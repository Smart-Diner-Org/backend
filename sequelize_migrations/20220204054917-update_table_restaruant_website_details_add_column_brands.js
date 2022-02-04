'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('restaurant_website_details', 'brands', {
        type: Sequelize.TEXT,
        notNull: true,
        defaultValue: null
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurant_website_details',
        'brands'
      )
    ]);
  }
};