// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../config/logger');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.usuario = usuario;
    next();
  } catch (error) {
    logger.error('Error al verificar token:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};