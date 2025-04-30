'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('productos', 'fragranciaId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('productos', 'fragranciaId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'fragrancias',
        key: 'id'
      }
    });
  }
}; 