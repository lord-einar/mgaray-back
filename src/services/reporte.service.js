// backend/src/services/reporte.service.js
const { Producto, Transaccion, Marca, Categoria, Fragancia, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class ReporteService {
  /**
   * Obtener productos más vendidos
   */
  async obtenerProductosMasVendidos(limite = 10, fechaInicio, fechaFin) {
    try {
      const whereClause = { tipo: 'VENTA' };
      
      if (fechaInicio && fechaFin) {
        whereClause.fecha = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      }
      
      const result = await Transaccion.findAll({
        attributes: [
          'productoId',
          [sequelize.fn('sum', sequelize.col('cantidad')), 'totalVendido'],
          [sequelize.fn('sum', sequelize.col('total')), 'totalIngresos'],
          [sequelize.fn('sum', sequelize.col('ganancia')), 'totalGanancias']
        ],
        where: whereClause,
        include: [
          { 
            model: Producto, 
            as: 'producto',
            attributes: ['nombre', 'precioVenta', 'stock'],
            include: [
              { model: Marca, as: 'marca' },
              { model: Categoria, as: 'categoria' },
              { model: Fragancia, as: 'fragancia' }
            ]
          }
        ],
        group: [
          'productoId', 
          'producto.id', 
          'producto.nombre', 
          'producto.precioVenta', 
          'producto.stock',
          'producto.marca.id',
          'producto.categoria.id',
          'producto.fragancia.id'
        ],
        order: [
          [sequelize.literal('totalVendido'), 'DESC']
        ],
        limit: limite
      });
      
      return result;
    } catch (error) {
      logger.error('Error al obtener productos más vendidos:', error);
      throw error;
    }
  }

  /**
   * Obtener ganancias semanales
   */
  async obtenerGananciasSemanales() {
    try {
      // Obtener fecha actual y fecha hace 7 semanas
      const fechaActual = new Date();
      const fecha7SemanasAtras = new Date();
      fecha7SemanasAtras.setDate(fecha7SemanasAtras.getDate() - 7 * 7);
      
      const result = await Transaccion.findAll({
        attributes: [
          [sequelize.fn('date_trunc', 'week', sequelize.col('fecha')), 'semana'],
          [sequelize.fn('sum', sequelize.col('ganancia')), 'totalGanancias'],
          [sequelize.fn('sum', sequelize.col('total')), 'totalVentas'],
          [sequelize.fn('count', sequelize.col('id')), 'cantidadTransacciones']
        ],
        where: {
          tipo: 'VENTA',
          fecha: {
            [Op.between]: [fecha7SemanasAtras, fechaActual]
          }
        },
        group: [sequelize.fn('date_trunc', 'week', sequelize.col('fecha'))],
        order: [sequelize.literal('semana')]
      });
      
      return result;
    } catch (error) {
      logger.error('Error al obtener ganancias semanales:', error);
      throw error;
    }
  }

  /**
   * Obtener ganancias mensuales
   */
  async obtenerGananciasMensuales() {
    try {
      // Obtener fecha actual y fecha hace 12 meses
      const fechaActual = new Date();
      const fecha12MesesAtras = new Date();
      fecha12MesesAtras.setMonth(fecha12MesesAtras.getMonth() - 12);
      
      const result = await Transaccion.findAll({
        attributes: [
          [sequelize.fn('date_trunc', 'month', sequelize.col('fecha')), 'mes'],
          [sequelize.fn('sum', sequelize.col('ganancia')), 'totalGanancias'],
          [sequelize.fn('sum', sequelize.col('total')), 'totalVentas'],
          [sequelize.fn('count', sequelize.col('id')), 'cantidadTransacciones']
        ],
        where: {
          tipo: 'VENTA',
          fecha: {
            [Op.between]: [fecha12MesesAtras, fechaActual]
          }
        },
        group: [sequelize.fn('date_trunc', 'month', sequelize.col('fecha'))],
        order: [sequelize.literal('mes')]
      });
      
      return result;
    } catch (error) {
      logger.error('Error al obtener ganancias mensuales:', error);
      throw error;
    }
  }
}

module.exports = new ReporteService();