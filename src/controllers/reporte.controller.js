// backend/src/controllers/reporte.controller.js
const reporteService = require('../services/reporte.service');
const logger = require('../config/logger');

exports.obtenerProductosMasVendidos = async (req, res) => {
  try {
    const { limite, fechaInicio, fechaFin } = req.query;
    
    const productos = await reporteService.obtenerProductosMasVendidos(
      limite ? parseInt(limite) : 10,
      fechaInicio ? new Date(fechaInicio) : null,
      fechaFin ? new Date(fechaFin) : null
    );
    
    return res.status(200).json(productos);
  } catch (error) {
    logger.error('Error al obtener productos más vendidos:', error);
    return res.status(500).json({
      error: 'Error al obtener productos más vendidos',
      message: error.message
    });
  }
};

exports.obtenerGananciasSemanales = async (req, res) => {
  try {
    const ganancias = await reporteService.obtenerGananciasSemanales();
    return res.status(200).json(ganancias);
  } catch (error) {
    logger.error('Error al obtener ganancias semanales:', error);
    return res.status(500).json({
      error: 'Error al obtener ganancias semanales',
      message: error.message
    });
  }
};

exports.obtenerGananciasMensuales = async (req, res) => {
  try {
    const ganancias = await reporteService.obtenerGananciasMensuales();
    return res.status(200).json(ganancias);
  } catch (error) {
    logger.error('Error al obtener ganancias mensuales:', error);
    return res.status(500).json({
      error: 'Error al obtener ganancias mensuales',
      message: error.message
    });
  }
};
