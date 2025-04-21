// backend/src/routes/notificacion.routes.js
const express = require('express');
const { notificacionController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, notificacionController.obtenerTodas);
router.get('/no-leidas', authMiddleware.verifyToken, notificacionController.obtenerNoLeidas);
router.put('/:id/marcar-leida', authMiddleware.verifyToken, notificacionController.marcarComoLeida);
router.put('/marcar-todas-leidas', authMiddleware.verifyToken, notificacionController.marcarTodasComoLeidas);

module.exports = router;