'use strict';

module.exports = {
up: function (queryInterface, Sequelize) {
return Promise.all([
  queryInterface.addColumn('delivery_requests', 'delivery_type', {
      type: Sequelize.BIGINT,
      notNull: false
  }),
  queryInterface.addColumn('delivery_requests', 'scheduled_data_time', {
    type:  Sequelize.DATE,
    notNull: false
  }),
  queryInterface.addColumn('delivery_requests', 'request_id', {
      type: Sequelize.TEXT,
      notNull: true,
  }),
  queryInterface.addColumn('delivery_requests', 'referrence_id', {
      type: Sequelize.TEXT,
      notNull: true,
  }),
  queryInterface.addColumn('delivery_requests', 'task_id', {
      type: Sequelize.TEXT,
      notNull: true,
  }),
  queryInterface.addColumn('delivery_requests', 'pick_up_details', {
      type: Sequelize.JSON,
      notNull: true,
  }),
  queryInterface.addColumn('delivery_requests', 'drop_details', {
      type: Sequelize.JSON,
      notNull: true,
  })
  ])
 },
 down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn(
        'delivery_requests',
        'delivery_type'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'scheduled_data_time'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'request_id'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'referrence_id'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'task_id'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'pick_up_details'
      ),
      queryInterface.removeColumn(
        'delivery_requests',
        'drop_details'
      )
    ]);
  }
};
