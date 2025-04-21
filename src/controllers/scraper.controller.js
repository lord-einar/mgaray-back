// backend/src/controllers/scraper.controller.js
const scraperService = require('../services/scraper.service');
const logger = require('../config/logger');

exports.ejecutarScraping = async (req, res) => {
  try {
    const resultados = await scraperService.ejecutarScrapingCompleto();
    return res.status(200).json(resultados);
  } catch (error) {
    logger.error('Error al ejecutar scraping:', error);
    return res.status(500).json({
      error: 'Error al ejecutar scraping',
      message: error.message
    });
  }
};

exports.sincronizarDatos = async (req, res) => {
  try {
    const { datosScraped } = req.body;
    
    if (!datosScraped) {
      return res.status(400).json({
        error: 'Se requieren los datos de scraping para sincronizar'
      });
    }
    
    const resultados = await scraperService.sincronizarDatos(datosScraped);
    return res.status(200).json(resultados);
  } catch (error) {
    logger.error('Error al sincronizar datos:', error);
    return res.status(500).json({
      error: 'Error al sincronizar datos',
      message: error.message
    });
  }
};