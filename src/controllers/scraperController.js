const saphirusScraper = require('../services/saphirusScraper');

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
    }
};

module.exports = scraperController; 