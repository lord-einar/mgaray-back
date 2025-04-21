// backend/src/routes/scraper.routes.js
const express = require('express');
const { scraperController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.post('/ejecutar', authMiddleware.verifyToken, scraperController.ejecutarScraping);
router.post('/sincronizar', authMiddleware.verifyToken, scraperController.sincronizarDatos);

module.exports = router;