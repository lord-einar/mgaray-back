require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const { sequelize } = require('./models');
const logger = require('./config/logger');
const routes = require('./routes');
const scraperRoutes = require('./routes/scraperRoutes');
const productoRoutes = require('./routes/producto.routes');
const syncRoutes = require('./routes/sync.routes');
const scheduledSyncService = require('./services/scheduledSync.service');

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

// Middleware de logging para debug
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api', routes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/sync', syncRoutes);

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
    
    // Iniciar el servicio de sincronización programada
    scheduledSyncService.start();
    
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
