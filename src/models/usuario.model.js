// backend/src/models/usuario.model.js
module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
      tableName: 'usuarios',
      timestamps: true
    });
  
    Usuario.associate = (models) => {
      Usuario.hasMany(models.Transaccion, {
        foreignKey: 'usuarioId',
        as: 'transacciones'
      });
    };
  
    return Usuario;
  };