// backend/src/controllers/fragrancia.controller.js
const { Fragancia } = require('../models');
const logger = require('../config/logger');

exports.obtenerTodas = async (req, res) => {
  try {
    const fragrancias = await Fragancia.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json(fragrancias);
  } catch (error) {
    logger.error('Error al obtener todas las fragancias:', error);
    return res.status(500).json({
      error: 'Error al obtener las fragancias',
      message: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const fragancia = await Fragancia.findByPk(id);
    
    if (!fragancia) {
      return res.status(404).json({
        error: 'Fragancia no encontrada'
      });
    }
    
    return res.status(200).json(fragancia);
  } catch (error) {
    logger.error(`Error al obtener fragancia con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al obtener la fragancia',
      message: error.message
    });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    const nuevaFragancia = await Fragancia.create({
      nombre,
      descripcion
    });
    
    return res.status(201).json(nuevaFragancia);
  } catch (error) {
    logger.error('Error al crear fragancia:', error);
    return res.status(500).json({
      error: 'Error al crear la fragancia',
      message: error.message
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const fragancia = await Fragancia.findByPk(id);
    
    if (!fragancia) {
      return res.status(404).json({
        error: 'Fragancia no encontrada'
      });
    }
    
    await fragancia.update({
      nombre,
      descripcion
    });
    
    return res.status(200).json(fragancia);
  } catch (error) {
    logger.error(`Error al actualizar fragancia con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al actualizar la fragancia',
      message: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fragancia = await Fragancia.findByPk(id);
    
    if (!fragancia) {
      return res.status(404).json({
        error: 'Fragancia no encontrada'
      });
    }
    
    await fragancia.destroy();
    
    return res.status(200).json({
      message: 'Fragancia eliminada correctamente'
    });
  } catch (error) {
    logger.error(`Error al eliminar fragancia con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al eliminar la fragancia',
      message: error.message
    });
  }
};