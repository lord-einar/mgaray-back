// backend/src/routes/scraper.routes.js
const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authMiddleware } = require('../middlewares');

// Rutas protegidas
router.post('/ejecutar', authMiddleware.verifyToken, scraperController.ejecutarScraping);
router.post('/sincronizar', authMiddleware.verifyToken, scraperController.sincronizarDatos);

// Rutas públicas
router.get('/products', scraperController.scrapeProducts);
router.get('/test-scrape-save', scraperController.testScrapeAndSave);
router.get('/brands', scraperController.getBrands);
router.get('/brands-with-categories', scraperController.getBrandsWithCategories);
router.get('/products/:brand/:category', scraperController.getProductsByCategory);

module.exports = router;