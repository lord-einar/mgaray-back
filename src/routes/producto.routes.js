// backend/src/routes/producto.routes.js
const express = require('express');
const { productoController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, productoController.getAllProductos);
router.get('/marca/:marcaId', authMiddleware.verifyToken, productoController.getProductosByMarca);
router.get('/marca/:marcaId/categoria/:categoriaId', authMiddleware.verifyToken, productoController.getProductosByMarcaAndCategoria);
router.get('/:id', authMiddleware.verifyToken, productoController.getProductoById);
router.get('/search', authMiddleware.verifyToken, productoController.searchProductos);
router.post('/', authMiddleware.verifyToken, productoController.createProducto);
router.put('/:id', authMiddleware.verifyToken, productoController.updateProducto);
router.delete('/:id', authMiddleware.verifyToken, productoController.deleteProducto);

module.exports = router;
