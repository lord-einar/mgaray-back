// src/services/transaccion.service.js

const { Transaccion, Producto, Usuario, sequelize, Marca, Categoria } = require('../models');
const productoService = require('./producto.service');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class TransaccionService {
  /**
   * Obtener todas las transacciones
   */
  async obtenerTodas() {
    try {
      return await Transaccion.findAll({
        include: [
          { 
            model: Producto, 
            as: 'producto',
            include: [
              { model: Marca, as: 'marca' },
              { model: Categoria, as: 'categoria' }
              // Eliminar la referencia a fragancia
            ]
          },
          { model: Usuario, as: 'usuario' }
        ],
        order: [['fecha', 'DESC']]
      });
    } catch (error) {
      logger.error('Error al obtener todas las transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtener una transacción por su ID
   */
  async obtenerPorId(id) {
    try {
      return await Transaccion.findByPk(id, {
        include: [
          { 
            model: Producto, 
            as: 'producto',
            include: [
              { model: Marca, as: 'marca' },
              { model: Categoria, as: 'categoria' }
              // Eliminar la referencia a fragancia
            ]
          },
          { model: Usuario, as: 'usuario' }
        ]
      });
    } catch (error) {
      logger.error(`Error al obtener transacción con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva transacción de venta
   */
  async registrarVenta(ventaData) {
    const transaction = await sequelize.transaction();
    
    try {
      const { productoId, cantidad, usuarioId } = ventaData;
      
      // Obtener producto
      const producto = await Producto.findByPk(productoId, { transaction });
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      if (producto.stock < cantidad) {
        throw new Error('Stock insuficiente');
      }
      
      // Calcular monto total y ganancia
      const precioUnitario = producto.precioVenta;
      const total = precioUnitario * cantidad;
      const ganancia = total - (producto.precioCompra * cantidad);
      
      // Crear transacción
      const nuevaTransaccion = await Transaccion.create({
        tipo: 'VENTA',
        productoId,
        cantidad,
        precioUnitario,
        total,
        ganancia,
        fecha: new Date(),
        usuarioId
      }, { transaction });
      
      // Actualizar stock
      await productoService.actualizarStock(productoId, cantidad, 'VENTA', transaction);
      
      await transaction.commit();
      return nuevaTransaccion;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al registrar venta:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva transacción de compra
   */
  async registrarCompra(compraData) {
    const transaction = await sequelize.transaction();
    
    try {
      const { productoId, cantidad, precioUnitario, usuarioId } = compraData;
      
      // Obtener producto
      const producto = await Producto.findByPk(productoId, { transaction });
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      // Calcular monto total
      const total = precioUnitario * cantidad;
      
      // Crear transacción
      const nuevaTransaccion = await Transaccion.create({
        tipo: 'COMPRA',
        productoId,
        cantidad,
        precioUnitario,
        total,
        ganancia: null, // No hay ganancia en compras
        fecha: new Date(),
        usuarioId
      }, { transaction });
      
      // Actualizar stock y precio de compra si es diferente
      await producto.update({ 
        stock: producto.stock + parseInt(cantidad),
        precioCompra: precioUnitario 
      }, { transaction });
      
      await transaction.commit();
      return nuevaTransaccion;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al registrar compra:', error);
      throw error;
    }
  }

  /**
   * Obtener transacciones por período
   */
  async obtenerPorPeriodo(fechaInicio, fechaFin) {
    try {
      return await Transaccion.findAll({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
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
          },
          { model: Usuario, as: 'usuario' }
        ],
        order: [['fecha', 'DESC']]
      });
    } catch (error) {
      logger.error(`Error al obtener transacciones por período:`, error);
      throw error;
    }
  }

  /**
   * Obtener ganancias por período
   */
  async obtenerGanancias(fechaInicio, fechaFin) {
    try {
      const result = await Transaccion.findAll({
        attributes: [
          [sequelize.fn('sum', sequelize.col('ganancia')), 'totalGanancias'],
          [sequelize.fn('sum', sequelize.col('total')), 'totalVentas'],
          [sequelize.fn('count', sequelize.col('id')), 'cantidadTransacciones']
        ],
        where: {
          tipo: 'VENTA',
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        }
      });
      
      return result[0];
    } catch (error) {
      logger.error(`Error al obtener ganancias por período:`, error);
      throw error;
    }
  }
}

module.exports = new TransaccionService();