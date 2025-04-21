// backend/src/controllers/notificacion.controller.js
const notificacionService = require('../services/notificacion.service');
const logger = require('../config/logger');

exports.obtenerTodas = async (req, res) => {
  try {
    const notificaciones = await notificacionService.obtenerTodas();
    return res.status(200).json(notificaciones);
  } catch (error) {
    logger.error('Error al obtener todas las notificaciones:', error);
    return res.status(500).json({
      error: 'Error al obtener las notificaciones',
      message: error.message
    });
  }
};

exports.obtenerNoLeidas = async (req, res) => {
  try {
    const notificaciones = await notificacionService.obtenerNoLeidas();
    return res.status(200).json(notificaciones);
  } catch (error) {
    logger.error('Error al obtener notificaciones no leídas:', error);
    return res.status(500).json({
      error: 'Error al obtener notificaciones no leídas',
      message: error.message
    });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await notificacionService.marcarComoLeida(id);
    return res.status(200).json(notificacion);
  } catch (error) {
    logger.error(`Error al marcar como leída la notificación con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al marcar notificación como leída',
      message: error.message
    });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const resultado = await notificacionService.marcarTodasComoLeidas();
    return res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al marcar todas las notificaciones como leídas:', error);
    return res.status(500).json({
      error: 'Error al marcar todas las notificaciones como leídas',
      message: error.message
    });
  }
};
