// backend/src/controllers/categoria.controller.js
const { Categoria } = require('../models');
const logger = require('../config/logger');

exports.obtenerTodas = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json(categorias);
  } catch (error) {
    logger.error('Error al obtener todas las categorías:', error);
    return res.status(500).json({
      error: 'Error al obtener las categorías',
      message: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }
    
    return res.status(200).json(categoria);
  } catch (error) {
    logger.error(`Error al obtener categoría con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al obtener la categoría',
      message: error.message
    });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion
    });
    
    return res.status(201).json(nuevaCategoria);
  } catch (error) {
    logger.error('Error al crear categoría:', error);
    return res.status(500).json({
      error: 'Error al crear la categoría',
      message: error.message
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const categoria = await Categoria.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }
    
    await categoria.update({
      nombre,
      descripcion
    });
    
    return res.status(200).json(categoria);
  } catch (error) {
    logger.error(`Error al actualizar categoría con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al actualizar la categoría',
      message: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoria = await Categoria.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }
    
    await categoria.destroy();
    
    return res.status(200).json({
      message: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    logger.error(`Error al eliminar categoría con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al eliminar la categoría',
      message: error.message
    });
  }
};