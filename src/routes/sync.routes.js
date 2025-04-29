const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');

// Ruta para sincronizar productos (temporalmente sin autenticación)
router.post('/products', syncController.syncProducts);

module.exports = router; 