// backend/src/controllers/pedido.controller.js
const { ProductoPedido, Producto, sequelize } = require('../models');
const logger = require('../config/logger');

exports.obtenerTodos = async (req, res) => {
  try {
    const pedidos = await ProductoPedido.findAll({
      include: [
        { model: Producto, as: 'producto' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(pedidos);
  } catch (error) {
    logger.error('Error al obtener todos los pedidos:', error);
    return res.status(500).json({
      error: 'Error al obtener los pedidos',
      message: error.message
    });
  }
};

exports.obtenerPendientes = async (req, res) => {
  try {
    const pedidos = await ProductoPedido.findAll({
      where: {
        completado: false
      },
      include: [
        { model: Producto, as: 'producto' }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    return res.status(200).json(pedidos);
  } catch (error) {
    logger.error('Error al obtener pedidos pendientes:', error);
    return res.status(500).json({
      error: 'Error al obtener pedidos pendientes',
      message: error.message
    });
  }
};

exports.crear = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productoId, cantidad } = req.body;
    
    // Verificar si el producto existe
    const producto = await Producto.findByPk(productoId, { transaction });
    
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }
    
    // Crear pedido
    const nuevoPedido = await ProductoPedido.create({
      productoId,
      cantidad,
      completado: false
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json(nuevoPedido);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error al crear pedido:', error);
    return res.status(500).json({
      error: 'Error al crear el pedido',
      message: error.message
    });
  }
};

exports.marcarComoCompletado = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Buscar el pedido
    const pedido = await ProductoPedido.findByPk(id, { transaction });
    
    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Pedido no encontrado'
      });
    }
    
    // Marcar como completado
    await pedido.update({ completado: true }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json(pedido);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error al marcar pedido ${req.params.id} como completado:`, error);
    return res.status(500).json({
      error: 'Error al marcar pedido como completado',
      message: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Buscar el pedido
    const pedido = await ProductoPedido.findByPk(id, { transaction });
    
    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Pedido no encontrado'
      });
    }
    
    // Eliminar pedido
    await pedido.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error al eliminar pedido ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al eliminar pedido',
      message: error.message
    });
  }
};