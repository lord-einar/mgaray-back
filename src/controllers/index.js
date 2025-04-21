// backend/src/controllers/index.js
const authController = require('./auth.controller');
const productoController = require('./producto.controller');
const marcaController = require('./marca.controller');
const categoriaController = require('./categoria.controller');
const fragranciaController = require('./fragancia.controller');
const transaccionController = require('./transaccion.controller');
const pedidoController = require('./pedido.controller');
const notificacionController = require('./notificacion.controller');
const reporteController = require('./reporte.controller');
const scraperController = require('./scraper.controller');

module.exports = {
  authController,
  productoController,
  marcaController,
  categoriaController,
  fragranciaController,
  transaccionController,
  pedidoController,
  notificacionController,
  reporteController,
  scraperController
};