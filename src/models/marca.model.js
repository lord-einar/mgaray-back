// backend/src/models/marca.model.js
module.exports = (sequelize, DataTypes) => {
    const Marca = sequelize.define('Marca', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
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
      tableName: 'marcas',
      timestamps: true
    });
  
    Marca.associate = (models) => {
      Marca.hasMany(models.Producto, {
        foreignKey: 'marcaId',
        as: 'productos'
      });
    };
  
    return Marca;
  };
  