// backend/src/controllers/transaccion.controller.js
const transaccionService = require('../services/transaccion.service');
const logger = require('../config/logger');

exports.obtenerTodas = async (req, res) => {
  try {
    const transacciones = await transaccionService.obtenerTodas();
    return res.status(200).json(transacciones);
  } catch (error) {
    logger.error('Error al obtener todas las transacciones:', error);
    return res.status(500).json({
      error: 'Error al obtener las transacciones',
      message: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await transaccionService.obtenerPorId(id);
    
    if (!transaccion) {
      return res.status(404).json({
        error: 'Transacción no encontrada'
      });
    }
    
    return res.status(200).json(transaccion);
  } catch (error) {
    logger.error(`Error al obtener transacción con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al obtener la transacción',
      message: error.message
    });
  }
};

exports.registrarVenta = async (req, res) => {
  try {
    // Agregar el ID del usuario autenticado
    const ventaData = {
      ...req.body,
      usuarioId: req.usuario.id
    };
    
    const nuevaVenta = await transaccionService.registrarVenta(ventaData);
    return res.status(201).json(nuevaVenta);
  } catch (error) {
    logger.error('Error al registrar venta:', error);
    return res.status(500).json({
      error: 'Error al registrar la venta',
      message: error.message
    });
  }
};

exports.registrarCompra = async (req, res) => {
  try {
    // Agregar el ID del usuario autenticado
    const compraData = {
      ...req.body,
      usuarioId: req.usuario.id
    };
    
    const nuevaCompra = await transaccionService.registrarCompra(compraData);
    return res.status(201).json(nuevaCompra);
  } catch (error) {
    logger.error('Error al registrar compra:', error);
    return res.status(500).json({
      error: 'Error al registrar la compra',
      message: error.message
    });
  }
};

exports.obtenerPorPeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'Se requieren fechaInicio y fechaFin como parámetros'
      });
    }
    
    const transacciones = await transaccionService.obtenerPorPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin)
    );
    
    return res.status(200).json(transacciones);
  } catch (error) {
    logger.error('Error al obtener transacciones por período:', error);
    return res.status(500).json({
      error: 'Error al obtener las transacciones por período',
      message: error.message
    });
  }
};