// backend/src/models/productoPedido.model.js
module.exports = (sequelize, DataTypes) => {
    const ProductoPedido = sequelize.define('ProductoPedido', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id'
        }
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      completado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'productos_pedido',
      timestamps: true
    });
  
    ProductoPedido.associate = (models) => {
      ProductoPedido.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    };
  
    return ProductoPedido;
  };
  