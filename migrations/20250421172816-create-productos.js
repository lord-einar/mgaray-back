// migrations/20230101000005-create-productos.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      marcaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'marcas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fragranciaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'fragrancias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      precioCompra: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      precioVenta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stockMinimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      enOferta: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      porcentajeDescuento: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      imagenUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      enStock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Índice para búsquedas por nombre
    await queryInterface.addIndex('productos', ['nombre']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('productos');
  }
};