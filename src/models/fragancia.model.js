// backend/src/models/fragancia.model.js
module.exports = (sequelize, DataTypes) => {
    const Fragancia = sequelize.define('Fragancia', {
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
      tableName: 'fragrancias',
      timestamps: true
    });
  
    Fragancia.associate = (models) => {
      Fragancia.hasMany(models.Producto, {
        foreignKey: 'fragranciaId',
        as: 'productos'
      });
    };
  
    return Fragancia;
  };