'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.createTable('push_notification_tokens', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        customer_id: { type: Sequelize.INTEGER, allowNull: true,
          references: {
            model: {
              tableName: 'customers',
              key: 'id'
            }
            
          }
        },
        token: { type: Sequelize.TEXT, unique: true, allowNull: false },
        token_status: { type: Sequelize.INTEGER, allowNull: false,
          references: {
            model: {
              tableName: 'push_notification_token_statuses',
              key: 'id'
            }
          }
        },
        token_timestamp: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        },
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
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_notification_tokens');
  }
};
