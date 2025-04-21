// backend/src/routes/producto.routes.js
const express = require('express');
const { productoController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, productoController.obtenerTodos);
router.get('/stock-bajo', authMiddleware.verifyToken, productoController.obtenerStockBajo);
router.get('/buscar', authMiddleware.verifyToken, productoController.buscar);
router.get('/:id', authMiddleware.verifyToken, productoController.obtenerPorId);
router.post('/', authMiddleware.verifyToken, productoController.crear);
router.put('/:id', authMiddleware.verifyToken, productoController.actualizar);
router.delete('/:id', authMiddleware.verifyToken, productoController.eliminar);

module.exports = router;
