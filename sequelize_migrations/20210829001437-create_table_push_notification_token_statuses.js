'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.createTable('push_notification_token_statuses', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        }
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_notification_token_statuses');
  }
};
