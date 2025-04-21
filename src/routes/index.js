// backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const marcaRoutes = require('./marca.routes');
const categoriaRoutes = require('./categoria.routes');
const fragranciaRoutes = require('./fragancia.routes');
const productoRoutes = require('./producto.routes');
const transaccionRoutes = require('./transaccion.routes');
const pedidoRoutes = require('./pedido.routes');
const notificacionRoutes = require('./notificacion.routes');
const reporteRoutes = require('./reporte.routes');
const scraperRoutes = require('./scraper.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/marcas', marcaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/fragrancias', fragranciaRoutes);
router.use('/productos', productoRoutes);
router.use('/transacciones', transaccionRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/reportes', reporteRoutes);
router.use('/scraper', scraperRoutes);

module.exports = router;