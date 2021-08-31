'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('delivery_partners', [
      {
        name: 'Dunzo',
        created_at: new Date(),
        updated_at: new Date()
      }]
    );
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('delivery_partners', {[Op.or]: [{name: 'Dunzo'}, {name: 'Dunzo'}]}, {});
  }
};
