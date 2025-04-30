const saphirusScraper = require('../services/saphirusScraper');
const saphirusSyncService = require('../services/saphirusSync.service');
const logger = require('../config/logger');

const scraperController = {
    async scrapeProducts(req, res) {
        try {
            const products = await saphirusScraper.scrapeAllProducts();
            res.json({
                success: true,
                data: products,
                total: products.length
            });
        } catch (error) {
            console.error('Error en el controlador de scraping:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los productos',
                message: error.message
            });
        }
    },

    async testScrapeAndSave(req, res) {
        try {
            logger.info('Iniciando prueba de scraping y guardado');
            
            // Obtener todos los productos
            const products = await saphirusScraper.scrapeAllProducts();
            
            // Agrupar productos por categoría para análisis
            const categories = {};
            products.forEach(product => {
                if (!categories[product.category]) {
                    categories[product.category] = 0;
                }
                categories[product.category]++;
            });
            
            logger.info('Categorías encontradas:', categories);
            
            // Guardar los productos
            const savedProducts = [];
            const failedProducts = [];
            
            for (const product of products) {
                try {
                    // Mostrar la estructura del producto antes de guardarlo
                    logger.info(`Intentando guardar producto: ${JSON.stringify(product, null, 2)}`);
                    
                    const savedProduct = await saphirusSyncService.createProduct(product);
                    savedProducts.push(savedProduct);
                    logger.info(`Producto guardado: ${product.name} (Categoría: ${product.category})`);
                } catch (error) {
                    logger.error(`Error al guardar producto ${product.name}:`, error);
                    failedProducts.push({
                        name: product.name,
                        error: error.message,
                        product: product
                    });
                }
            }
            
            // Mostrar un resumen de los primeros productos que fallaron
            const failedSummary = failedProducts.slice(0, 5).map(fail => ({
                name: fail.name,
                error: fail.error,
                productData: fail.product
            }));
            
            res.json({
                success: true,
                message: 'Prueba completada',
                totalScraped: products.length,
                totalSaved: savedProducts.length,
                totalFailed: failedProducts.length,
                categories: categories,
                firstScrapedProducts: products.slice(0, 5), // Mostrar los primeros 5 productos scrapeados
                failedExamples: failedSummary // Mostrar ejemplos de fallos
            });
        } catch (error) {
            logger.error('Error en la prueba de scraping y guardado:', error);
            res.status(500).json({
                success: false,
                error: 'Error en la prueba',
                message: error.message,
                stack: error.stack
            });
        }
    },

    async getBrands(req, res) {
        try {
            const brands = await saphirusScraper.getBrands();
            res.json({
                success: true,
                data: brands,
                total: brands.length
            });
        } catch (error) {
            console.error('Error al obtener las marcas:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener las marcas',
                message: error.message
            });
        }
    },

    async getBrandsWithCategories(req, res) {
        try {
            const brandsStructure = await saphirusScraper.getBrandsWithCategories();
            res.json({
                success: true,
                data: brandsStructure,
                total: brandsStructure.length
            });
        } catch (error) {
            console.error('Error al obtener la estructura de marcas y categorías:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener la estructura de marcas y categorías',
                message: error.message
            });
        }
    },

    async getProductsByCategory(req, res) {
        try {
            const { brand, category } = req.params;
            
            if (!brand || !category) {
                return res.status(400).json({
                    success: false,
                    error: 'Marca y categoría son requeridos'
                });
            }
            
            const result = await saphirusScraper.getProductsByCategory(brand, category);
            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener productos por categoría',
                message: error.message
            });
        }
    },

    async ejecutarScraping(req, res) {
        try {
            logger.info('Iniciando scraping de productos');
            const products = await saphirusScraper.scrapeAllProducts();
            
            res.json({
                success: true,
                message: 'Scraping completado',
                total: products.length,
                data: products
            });
        } catch (error) {
            logger.error('Error al ejecutar scraping:', error);
            res.status(500).json({
                success: false,
                error: 'Error al ejecutar scraping',
                message: error.message
            });
        }
    },

    async sincronizarDatos(req, res) {
        try {
            logger.info('Iniciando sincronización de datos');
            const result = await saphirusSyncService.syncAllProducts();
            
            res.json({
                success: true,
                message: 'Sincronización completada',
                ...result
            });
        } catch (error) {
            logger.error('Error al sincronizar datos:', error);
            res.status(500).json({
                success: false,
                error: 'Error al sincronizar datos',
                message: error.message
            });
        }
    }
};

module.exports = scraperController; 