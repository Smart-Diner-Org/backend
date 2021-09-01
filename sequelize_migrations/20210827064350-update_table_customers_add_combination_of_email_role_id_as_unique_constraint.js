'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addConstraint('customers', {fields: ['email', 'role_id'],
        type: 'unique',
        name: 'customer_role_email_combination_unique'
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface. removeConstraint(
        'customers',
        'customer_role_email_combination_unique'
      )
    ]);
  }
};
