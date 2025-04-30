// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../config/logger');

exports.verifyToken = async (req, res, next) => {
  logger.info('=============== VERIFY TOKEN MIDDLEWARE ===============');
  logger.info(`Request path: ${req.method} ${req.path}`);
  logger.info(`Headers Authorization: ${req.headers.authorization ? 'Presente' : 'Ausente'}`);
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error('TOKEN NO PROPORCIONADO');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.error(`FORMATO DE TOKEN INVÁLIDO: ${authHeader}`);
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    const token = parts[1];
    logger.info(`Token recibido: ${token.substring(0, 20)}...`);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`Token decodificado: ${JSON.stringify(decoded)}`);
      
      const usuario = await Usuario.findByPk(decoded.id);
      
      if (!usuario) {
        logger.error(`USUARIO NO ENCONTRADO PARA ID: ${decoded.id}`);
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      logger.info(`Usuario encontrado: ${usuario.email}`);
      req.usuario = usuario;
      logger.info('=============== FIN VERIFY TOKEN - ÉXITO ===============');
      next();
    } catch (jwtError) {
      logger.error('ERROR AL VERIFICAR JWT:');
      logger.error(jwtError.stack || jwtError.message || jwtError);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  } catch (error) {
    logger.error('ERROR EN MIDDLEWARE AUTH:');
    logger.error(error.stack || error.message || error);
    logger.info('=============== FIN VERIFY TOKEN - ERROR ===============');
    return res.status(500).json({ message: 'Error interno del servidor al verificar token' });
  }
};