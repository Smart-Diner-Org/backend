'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // return Promise.all([
    //   await queryInterface.changeColumn(
    //     "delivery_requests",
    //     "task_id",
    //     {
    //       unique : true
    //     }
    //   )
    // ]);

    return Promise.all([
      queryInterface.addConstraint('delivery_requests', {fields: ['task_id'],
        type: 'unique',
        name: 'delivery_requests_task_id_unique'
      })
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.changeColumn(
    //   "delivery_requests",
    //   "task_id",
    //   {
    //     unique : false
    //   }
    // );
    return Promise.all([
      queryInterface. removeConstraint(
        'delivery_requests',
        'delivery_requests_task_id_unique'
      )
    ]);
  }
};
