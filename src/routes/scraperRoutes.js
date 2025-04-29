const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

router.get('/products', scraperController.scrapeProducts);
router.get('/brands', scraperController.getBrands);
router.get('/brands/categories', scraperController.getBrandsWithCategories);
router.get('/products/:brand/:category', scraperController.getProductsByCategory);

module.exports = router; 