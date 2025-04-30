// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

exports.googleCallback = (req, res) => {
  logger.info('=============== INICIANDO GOOGLE CALLBACK ===============');
  logger.info(`Request recibido: ${req.method} ${req.url}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  
  try {
    // Verificar que req.user existe (establecido por passport)
    if (!req.user) {
      logger.error('ERROR: Usuario no encontrado en req.user');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
    
    logger.info(`Usuario encontrado: ${JSON.stringify(req.user)}`);
    
    // Generar JWT con información del usuario
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info(`Token JWT generado: ${token.substring(0, 20)}...`);
    
    // Redireccionar al frontend con el token como parámetro de consulta
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}?token=${token}`;
    
    logger.info(`URL de redirección completa: ${redirectUrl}`);
    logger.info('=============== FIN GOOGLE CALLBACK ===============');
    
    // Agregar headers para debugging
    res.setHeader('X-Auth-Redirect-To', redirectUrl);
    res.setHeader('X-Auth-Status', 'success');
    
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('ERROR EN CALLBACK DE GOOGLE:');
    logger.error(error.stack || error.message || error);
    
    res.setHeader('X-Auth-Status', 'error');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed&reason=${encodeURIComponent(error.message || 'unknown')}`);
  }
};

exports.checkAuth = (req, res) => {
  logger.info('=============== CHECK AUTH LLAMADO ===============');
  logger.info(`Request recibido: ${req.method} ${req.url}`);
  logger.info(`Headers Auth: ${req.headers.authorization ? 'Presente' : 'Ausente'}`);
  
  try {
    // req.usuario debe establecerse por el middleware de autenticación
    if (!req.usuario) {
      logger.error('No hay usuario en la solicitud - middleware auth falló');
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    logger.info(`Usuario autenticado: ${JSON.stringify(req.usuario)}`);
    logger.info('=============== FIN CHECK AUTH ===============');
    
    res.status(200).json({ 
      user: {
        id: req.usuario.id,
        email: req.usuario.email,
        nombre: req.usuario.nombre
      }
    });
  } catch (error) {
    logger.error('ERROR EN CHECK AUTH:');
    logger.error(error.stack || error.message || error);
    res.status(500).json({ message: 'Error al verificar la autenticación' });
  }
};

exports.logout = (req, res) => {
  logger.info('=============== LOGOUT LLAMADO ===============');
  logger.info(`Request recibido: ${req.method} ${req.url}`);
  logger.info(`Headers Auth: ${req.headers.authorization ? 'Presente' : 'Ausente'}`);
  logger.info('=============== FIN LOGOUT ===============');
  
  // En un sistema sin sesiones, solo necesitamos informar al cliente
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};