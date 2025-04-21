// backend/src/models/notificacion.model.js
module.exports = (sequelize, DataTypes) => {
    const Notificacion = sequelize.define('Notificacion', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo: {
        type: DataTypes.ENUM('BAJO_STOCK', 'NUEVA_VENTA', 'PRODUCTO_NUEVO', 'CAMBIO_PRECIO'),
        allowNull: false
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'productos',
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
      tableName: 'notificaciones',
      timestamps: true
    });
  
    Notificacion.associate = (models) => {
      Notificacion.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    };
  
    return Notificacion;
  };