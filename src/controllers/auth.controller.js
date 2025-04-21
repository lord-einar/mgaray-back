// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

exports.googleCallback = (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redireccionar al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
  } catch (error) {
    logger.error('Error en callback de Google:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
  }
};

exports.checkAuth = (req, res) => {
  res.status(200).json({ 
    user: {
      id: req.usuario.id,
      email: req.usuario.email,
      nombre: req.usuario.nombre
    }
  });
};

exports.logout = (req, res) => {
  // En un sistema sin sesiones, solo necesitamos informar al cliente
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};