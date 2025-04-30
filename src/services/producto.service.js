// backend/src/services/producto.service.js
const { Producto, Marca, Categoria, Fragancia, Notificacion, sequelize } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class ProductoService {
  /**
   * Obtener todos los productos con sus relaciones
   */
  async obtenerTodos() {
  try {
    return await Producto.findAll({
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' }
        // Eliminamos la referencia a fragancia
      ],
      order: [['nombre', 'ASC']]
    });
  } catch (error) {
    logger.error('Error al obtener todos los productos:', error);
    throw error;
  }
}


  /**
   * Obtener un producto por su ID
   */
async obtenerPorId(id) {
  try {
    return await Producto.findByPk(id, {
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' }
        // Eliminamos la referencia a fragancia
      ]
    });
  } catch (error) {
    logger.error(`Error al obtener producto con ID ${id}:`, error);
    throw error;
  }
}


  /**
   * Crear un nuevo producto
   */
  async crear(productoData) {
    const transaction = await sequelize.transaction();
    
    try {
      const producto = await Producto.create(productoData, { transaction });
      
      await transaction.commit();
      return producto;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear producto:', error);
      throw error;
    }
  }

  /**
   * Actualizar un producto existente
   */
  async actualizar(id, productoData) {
    const transaction = await sequelize.transaction();
    
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      await producto.update(productoData, { transaction });
      
      await transaction.commit();
      return producto;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un producto
   */
  async eliminar(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      await producto.destroy({ transaction });
      
      await transaction.commit();
      return { message: 'Producto eliminado correctamente' };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al eliminar producto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar el stock de un producto
   */
  async actualizarStock(id, cantidad, tipo, externalTransaction = null) {
    const transaction = externalTransaction || await sequelize.transaction();
    
    try {
      const producto = await Producto.findByPk(id, { transaction });
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      let nuevoStock;
      
      if (tipo === 'VENTA') {
        nuevoStock = producto.stock - cantidad;
        
        if (nuevoStock < 0) {
          throw new Error('Stock insuficiente');
        }
      } else if (tipo === 'COMPRA') {
        nuevoStock = producto.stock + cantidad;
      } else {
        throw new Error('Tipo de transacción inválido');
      }
      
      await producto.update({ stock: nuevoStock }, { transaction });
      
      // Verificar si el stock es bajo después de una venta
      if (tipo === 'VENTA' && nuevoStock <= producto.stockMinimo) {
        await Notificacion.create({
          tipo: 'BAJO_STOCK',
          mensaje: `El producto ${producto.nombre} tiene un stock bajo (${nuevoStock}).`,
          productoId: producto.id
        }, { transaction });
      }
      
      if (!externalTransaction) {
        await transaction.commit();
      }
      
      return producto;
    } catch (error) {
      if (!externalTransaction) {
        await transaction.rollback();
      }
      logger.error(`Error al actualizar stock del producto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener productos con stock bajo
   */
async obtenerProductosStockBajo() {
  try {
    return await Producto.findAll({
      where: {
        stock: {
          [Op.lte]: sequelize.col('stockMinimo')
        }
      },
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' }
        // Eliminamos la referencia a fragancia
      ],
      order: [['stock', 'ASC']]
    });
  } catch (error) {
    logger.error('Error al obtener productos con stock bajo:', error);
    throw error;
  }
}


  /**
   * Buscar productos por término
   */
async buscar(termino) {
  try {
    return await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${termino}%` } },
          { descripcion: { [Op.iLike]: `%${termino}%` } }
        ]
      },
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' }
        // Eliminamos la referencia a fragancia
      ],
      order: [['nombre', 'ASC']]
    });
  } catch (error) {
    logger.error(`Error al buscar productos con término '${termino}':`, error);
    throw error;
  }
}
}

module.exports = new ProductoService();