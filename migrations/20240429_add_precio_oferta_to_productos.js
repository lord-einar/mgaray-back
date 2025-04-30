'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('productos', 'precioOferta', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('productos', 'precioOferta');
  }
}; 