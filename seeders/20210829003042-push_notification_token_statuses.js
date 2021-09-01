'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('push_notification_token_statuses', [
      {
        name: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'UNREGISTERED',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'INVALID_ARGUMENT',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('push_notification_token_statuses', null, {});
  }
};
