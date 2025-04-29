'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('productos', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('productos', 'productUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('productos', 'labels', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('productos', 'sku');
    await queryInterface.removeColumn('productos', 'productUrl');
    await queryInterface.removeColumn('productos', 'labels');
  }
}; 