// backend/src/routes/pedido.routes.js
const express = require('express');
const { pedidoController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, pedidoController.obtenerTodos);
router.get('/pendientes', authMiddleware.verifyToken, pedidoController.obtenerPendientes);
router.post('/', authMiddleware.verifyToken, pedidoController.crear);
router.put('/:id/completar', authMiddleware.verifyToken, pedidoController.marcarComoCompletado);
router.delete('/:id', authMiddleware.verifyToken, pedidoController.eliminar);

module.exports = router;