// src/services/notificacion.service.js

const { Notificacion, Producto, Marca, Categoria } = require('../models');
const logger = require('../config/logger');

class NotificacionService {
  /**
   * Obtener todas las notificaciones
   */
  async obtenerTodas() {
    try {
      return await Notificacion.findAll({
        include: [
          { 
            model: Producto, 
            as: 'producto',
            include: [
              { model: Marca, as: 'marca' },
              { model: Categoria, as: 'categoria' }
              // Eliminar la referencia a fragancia
            ] 
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error('Error al obtener todas las notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  async obtenerNoLeidas() {
    try {
      return await Notificacion.findAll({
        where: {
          leida: false
        },
        include: [
          { 
            model: Producto, 
            as: 'producto',
            include: [
              { model: Marca, as: 'marca' },
              { model: Categoria, as: 'categoria' }
              // Eliminar la referencia a fragancia
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error('Error al obtener notificaciones no leídas:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(id) {
    try {
      const notificacion = await Notificacion.findByPk(id);
      
      if (!notificacion) {
        throw new Error('Notificación no encontrada');
      }
      
      await notificacion.update({ leida: true });
      
      return notificacion;
    } catch (error) {
      logger.error(`Error al marcar como leída la notificación con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas() {
    try {
      await Notificacion.update(
        { leida: true },
        { where: { leida: false } }
      );
      
      return { message: 'Todas las notificaciones han sido marcadas como leídas' };
    } catch (error) {
      logger.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva notificación
   */
  async crear(notificacionData) {
    try {
      return await Notificacion.create(notificacionData);
    } catch (error) {
      logger.error('Error al crear notificación:', error);
      throw error;
    }
  }
}

module.exports = new NotificacionService();