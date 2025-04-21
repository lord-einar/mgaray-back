// backend/src/models/producto.model.js
module.exports = (sequelize, DataTypes) => {
    const Producto = sequelize.define('Producto', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      marcaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'marcas',
          key: 'id'
        }
      },
      categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        }
      },
      fragranciaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'fragrancias',
          key: 'id'
        }
      },
      precioCompra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stockMinimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      enOferta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      porcentajeDescuento: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      imagenUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      enStock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      tableName: 'productos',
      timestamps: true
    });
  
    Producto.associate = (models) => {
      Producto.belongsTo(models.Marca, {
        foreignKey: 'marcaId',
        as: 'marca'
      });
      Producto.belongsTo(models.Categoria, {
        foreignKey: 'categoriaId',
        as: 'categoria'
      });
      Producto.belongsTo(models.Fragancia, {
        foreignKey: 'fragranciaId',
        as: 'fragancia'
      });
      Producto.hasMany(models.Transaccion, {
        foreignKey: 'productoId',
        as: 'transacciones'
      });
      Producto.hasMany(models.ProductoPedido, {
        foreignKey: 'productoId',
        as: 'pedidos'
      });
      Producto.hasMany(models.Notificacion, {
        foreignKey: 'productoId',
        as: 'notificaciones'
      });
    };
  
    return Producto;
  };