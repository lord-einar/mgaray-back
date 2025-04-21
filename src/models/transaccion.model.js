// backend/src/models/transaccion.model.js
module.exports = (sequelize, DataTypes) => {
    const Transaccion = sequelize.define('Transaccion', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo: {
        type: DataTypes.ENUM('VENTA', 'COMPRA'),
        allowNull: false
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
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      ganancia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
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
      tableName: 'transacciones',
      timestamps: true
    });
  
    Transaccion.associate = (models) => {
      Transaccion.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
      Transaccion.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
        as: 'usuario'
      });
    };
  
    return Transaccion;
  };