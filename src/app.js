require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const { sequelize } = require('./models');
const logger = require('./config/logger');
const routes = require('./routes');

// Configuración de Passport
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(passport.initialize());

// Rutas
app.use('/api', routes);

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor'
    }
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida correctamente.');
    
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en el puerto ${PORT}`);
    });
  } catch (error) {
    logger.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Para pruebas
