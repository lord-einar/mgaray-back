// backend/src/routes/marca.routes.js
const express = require('express');
const { marcaController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, marcaController.obtenerTodas);
router.get('/:id', authMiddleware.verifyToken, marcaController.obtenerPorId);
router.post('/', authMiddleware.verifyToken, marcaController.crear);
router.put('/:id', authMiddleware.verifyToken, marcaController.actualizar);
router.delete('/:id', authMiddleware.verifyToken, marcaController.eliminar);

module.exports = router;