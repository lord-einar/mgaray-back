// backend/src/routes/reporte.routes.js
const express = require('express');
const { reporteController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/productos-mas-vendidos', authMiddleware.verifyToken, reporteController.obtenerProductosMasVendidos);
router.get('/ganancias-semanales', authMiddleware.verifyToken, reporteController.obtenerGananciasSemanales);
router.get('/ganancias-mensuales', authMiddleware.verifyToken, reporteController.obtenerGananciasMensuales);

module.exports = router;