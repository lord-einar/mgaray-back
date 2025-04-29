// backend/src/controllers/producto.controller.js
const productoService = require('../services/producto.service');
const logger = require('../config/logger');
const { Producto, Marca, Categoria, Fragancia } = require('../models');
const { Op } = require('sequelize');

exports.obtenerTodos = async (req, res) => {
  try {
    const productos = await productoService.obtenerTodos();
    return res.status(200).json(productos);
  } catch (error) {
    logger.error('Error al obtener todos los productos:', error);
    return res.status(500).json({
      error: 'Error al obtener los productos',
      message: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.obtenerPorId(id);
    
    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }
    
    return res.status(200).json(producto);
  } catch (error) {
    logger.error(`Error al obtener producto con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al obtener el producto',
      message: error.message
    });
  }
};

exports.crear = async (req, res) => {
  try {
    const nuevoProducto = await productoService.crear(req.body);
    return res.status(201).json(nuevoProducto);
  } catch (error) {
    logger.error('Error al crear producto:', error);
    return res.status(500).json({
      error: 'Error al crear el producto',
      message: error.message
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const productoActualizado = await productoService.actualizar(id, req.body);
    return res.status(200).json(productoActualizado);
  } catch (error) {
    logger.error(`Error al actualizar producto con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al actualizar el producto',
      message: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await productoService.eliminar(id);
    return res.status(200).json(resultado);
  } catch (error) {
    logger.error(`Error al eliminar producto con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al eliminar el producto',
      message: error.message
    });
  }
};

exports.obtenerStockBajo = async (req, res) => {
  try {
    const productos = await productoService.obtenerProductosStockBajo();
    return res.status(200).json(productos);
  } catch (error) {
    logger.error('Error al obtener productos con stock bajo:', error);
    return res.status(500).json({
      error: 'Error al obtener productos con stock bajo',
      message: error.message
    });
  }
};

exports.buscar = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        error: 'Se requiere un término de búsqueda'
      });
    }
    
    const productos = await productoService.buscar(termino);
    return res.status(200).json(productos);
  } catch (error) {
    logger.error(`Error al buscar productos con término '${req.query.termino}':`, error);
    return res.status(500).json({
      error: 'Error al buscar productos',
      message: error.message
    });
  }
};

// Obtener todos los productos con sus relaciones
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' },
        { model: Fragancia, as: 'fragancia' }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener productos por marca
exports.getProductosByMarca = async (req, res) => {
  try {
    const { marcaId } = req.params;
    const productos = await Producto.findAll({
      where: { marcaId },
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' },
        { model: Fragancia, as: 'fragancia' }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener productos por marca y categoría
exports.getProductosByMarcaAndCategoria = async (req, res) => {
  try {
    const { marcaId, categoriaId } = req.params;
    const productos = await Producto.findAll({
      where: { 
        marcaId,
        categoriaId
      },
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' },
        { model: Fragancia, as: 'fragancia' }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' },
        { model: Fragancia, as: 'fragancia' }
      ]
    });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar productos por nombre o SKU
exports.searchProductos = async (req, res) => {
  try {
    const { query } = req.query;
    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { sku: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        { model: Marca, as: 'marca' },
        { model: Categoria, as: 'categoria' },
        { model: Fragancia, as: 'fragancia' }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(req.body, {
      where: { id }
    });
    if (updated) {
      const updatedProducto = await Producto.findByPk(id);
      res.json(updatedProducto);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Producto.destroy({
      where: { id }
    });
    if (deleted) {
      res.json({ message: 'Producto eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};