// backend/src/controllers/marca.controller.js
const { Marca } = require('../models');
const logger = require('../config/logger');

exports.obtenerTodas = async (req, res) => {
  try {
    const marcas = await Marca.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json(marcas);
  } catch (error) {
    logger.error('Error al obtener todas las marcas:', error);
    return res.status(500).json({
      error: 'Error al obtener las marcas',
      message: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await Marca.findByPk(id);
    
    if (!marca) {
      return res.status(404).json({
        error: 'Marca no encontrada'
      });
    }
    
    return res.status(200).json(marca);
  } catch (error) {
    logger.error(`Error al obtener marca con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al obtener la marca',
      message: error.message
    });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    const nuevaMarca = await Marca.create({
      nombre,
      descripcion
    });
    
    return res.status(201).json(nuevaMarca);
  } catch (error) {
    logger.error('Error al crear marca:', error);
    return res.status(500).json({
      error: 'Error al crear la marca',
      message: error.message
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const marca = await Marca.findByPk(id);
    
    if (!marca) {
      return res.status(404).json({
        error: 'Marca no encontrada'
      });
    }
    
    await marca.update({
      nombre,
      descripcion
    });
    
    return res.status(200).json(marca);
  } catch (error) {
    logger.error(`Error al actualizar marca con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al actualizar la marca',
      message: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const marca = await Marca.findByPk(id);
    
    if (!marca) {
      return res.status(404).json({
        error: 'Marca no encontrada'
      });
    }
    
    await marca.destroy();
    
    return res.status(200).json({
      message: 'Marca eliminada correctamente'
    });
  } catch (error) {
    logger.error(`Error al eliminar marca con ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Error al eliminar la marca',
      message: error.message
    });
  }
};