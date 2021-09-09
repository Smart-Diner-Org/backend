'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('delivery_stages', [
      {
        name: 'Reached For Pickup',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Picked',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Reached For Delivery',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Runner Cancelled',
        created_at: new Date(),
        updated_at: new Date()
      }]
    );
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete('delivery_stages', {[Op.or]: [
      {name: 'Reached For Pickup'},
      {name: 'Picked'},
      {name: 'Reached For Delivery'},
      {name: 'Runner Cancelled'}
      ]}, {});
  }
};
