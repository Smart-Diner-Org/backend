'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('restaurant_menu_category_sequences', 'is_running', {
        type: Sequelize.BOOLEAN,
        notNull: false,
        defaultValue: true
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurant_menu_category_sequences',
        'is_running'
      )
    ]);
  }
};
