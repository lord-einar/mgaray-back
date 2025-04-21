// backend/src/routes/fragrancia.routes.js
const express = require('express');
const { fragranciaController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, fragranciaController.obtenerTodas);
router.get('/:id', authMiddleware.verifyToken, fragranciaController.obtenerPorId);
router.post('/', authMiddleware.verifyToken, fragranciaController.crear);
router.put('/:id', authMiddleware.verifyToken, fragranciaController.actualizar);
router.delete('/:id', authMiddleware.verifyToken, fragranciaController.eliminar);

module.exports = router;