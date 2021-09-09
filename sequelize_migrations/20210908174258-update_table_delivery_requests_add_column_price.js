'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('delivery_requests', 'price', {
        type: Sequelize.DECIMAL,
        notNull: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'delivery_requests',
        'price'
      )
    ]);
  }
};
