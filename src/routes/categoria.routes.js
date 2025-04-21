// backend/src/routes/categoria.routes.js
const express = require('express');
const { categoriaController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, categoriaController.obtenerTodas);
router.get('/:id', authMiddleware.verifyToken, categoriaController.obtenerPorId);
router.post('/', authMiddleware.verifyToken, categoriaController.crear);
router.put('/:id', authMiddleware.verifyToken, categoriaController.actualizar);
router.delete('/:id', authMiddleware.verifyToken, categoriaController.eliminar);

module.exports = router;