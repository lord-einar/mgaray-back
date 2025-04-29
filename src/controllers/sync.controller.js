const saphirusSyncService = require('../services/saphirusSync.service');
const logger = require('../config/logger');

exports.syncProducts = async (req, res) => {
  try {
    logger.info('Iniciando sincronización de productos');
    const result = await saphirusSyncService.syncAllProducts();
    res.json(result);
  } catch (error) {
    logger.error('Error en la sincronización:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en la sincronización', 
      error: error.message 
    });
  }
}; 