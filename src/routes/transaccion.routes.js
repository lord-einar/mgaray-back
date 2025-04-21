// backend/src/routes/transaccion.routes.js
const express = require('express');
const { transaccionController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, transaccionController.obtenerTodas);
router.get('/periodo', authMiddleware.verifyToken, transaccionController.obtenerPorPeriodo);
router.get('/:id', authMiddleware.verifyToken, transaccionController.obtenerPorId);
router.post('/venta', authMiddleware.verifyToken, transaccionController.registrarVenta);
router.post('/compra', authMiddleware.verifyToken, transaccionController.registrarCompra);

module.exports = router;