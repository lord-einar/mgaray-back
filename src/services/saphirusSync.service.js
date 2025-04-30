const { Producto, Marca, Categoria } = require('../models');
const saphirusScraper = require('./saphirusScraper');
const logger = require('../config/logger');

class SaphirusSyncService {
  async getBrandsWithCategories() {
    try {
      return await saphirusScraper.getBrandsWithCategories();
    } catch (error) {
      logger.error('Error al obtener marcas y categorías:', error);
      throw error;
    }
  }

  async getProductsByCategory(brand, category) {
    try {
      return await saphirusScraper.getProductsByCategory(brand, category);
    } catch (error) {
      logger.error(`Error al obtener productos para ${brand}/${category}:`, error);
      throw error;
    }
  }

  async findProductBySku(sku) {
    try {
      return await Producto.findOne({ where: { sku } });
    } catch (error) {
      logger.error(`Error al buscar producto con SKU ${sku}:`, error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      // Crear o encontrar la marca
      const [marca] = await Marca.findOrCreate({
        where: { nombre: productData.brand },
        defaults: { nombre: productData.brand }
      });

      // Crear o encontrar la categoría
      const [categoria] = await Categoria.findOrCreate({
        where: { nombre: productData.category },
        defaults: { nombre: productData.category }
      });

      // Crear el producto
      return await Producto.create({
        nombre: productData.name,
        descripcion: productData.description,
        sku: productData.sku,
        marcaId: marca.id,
        categoriaId: categoria.id,
        precioVenta: parseFloat(productData.price.regular.replace('$', '').replace('.', '')),
        precioOferta: productData.price.sale ? parseFloat(productData.price.sale.replace('$', '').replace('.', '')) : null,
        enOferta: productData.price.sale !== null,
        porcentajeDescuento: productData.price.sale ? Math.round(((parseFloat(productData.price.regular.replace('$', '').replace('.', '')) - parseFloat(productData.price.sale.replace('$', '').replace('.', ''))) / parseFloat(productData.price.regular.replace('$', '').replace('.', ''))) * 100) : null,
        imagenUrl: productData.imageUrl,
        productUrl: productData.productUrl,
        labels: productData.labels,
        enStock: productData.stock === 'instock'
      });
    } catch (error) {
      logger.error(`Error al crear producto ${productData.name}:`, error);
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      const marca = await Marca.findOne({ where: { nombre: productData.brand } });
      const categoria = await Categoria.findOne({ where: { nombre: productData.category } });

      if (!marca || !categoria) {
        throw new Error(`Marca o categoría no encontrada para ${productData.name}`);
      }

      const [updated] = await Producto.update({
        nombre: productData.name,
        descripcion: productData.description,
        marcaId: marca.id,
        categoriaId: categoria.id,
        precioVenta: parseFloat(productData.price.regular.replace('$', '').replace('.', '')),
        precioOferta: productData.price.sale ? parseFloat(productData.price.sale.replace('$', '').replace('.', '')) : null,
        enOferta: productData.price.sale !== null,
        porcentajeDescuento: productData.price.sale ? Math.round(((parseFloat(productData.price.regular.replace('$', '').replace('.', '')) - parseFloat(productData.price.sale.replace('$', '').replace('.', ''))) / parseFloat(productData.price.regular.replace('$', '').replace('.', ''))) * 100) : null,
        imagenUrl: productData.imageUrl,
        productUrl: productData.productUrl,
        labels: productData.labels,
        enStock: productData.stock === 'instock'
      }, {
        where: { id: productId }
      });

      if (!updated) {
        throw new Error(`No se pudo actualizar el producto ${productData.name}`);
      }

      return await Producto.findByPk(productId);
    } catch (error) {
      logger.error(`Error al actualizar producto ${productData.name}:`, error);
      throw error;
    }
  }

  async syncAllProducts() {
    try {
      logger.info('Iniciando sincronización de productos desde Saphirus');
      
      // Obtener la estructura de marcas y categorías
      const brandsStructure = await this.getBrandsWithCategories();
      
      for (const brand of brandsStructure) {
        // Crear o actualizar la marca
        const [marca] = await Marca.findOrCreate({
          where: { nombre: brand.name },
          defaults: { nombre: brand.name }
        });
        
        for (const category of brand.categories) {
          // Crear o actualizar la categoría
          const [categoria] = await Categoria.findOrCreate({
            where: { nombre: category.name },
            defaults: { nombre: category.name }
          });
          
          // Obtener productos de esta marca y categoría
          const productsData = await this.getProductsByCategory(brand.name, category.name);
          
          for (const productData of productsData.products) {
            // Crear o actualizar el producto
            await Producto.findOrCreate({
              where: { sku: productData.sku },
              defaults: {
                nombre: productData.name,
                descripcion: productData.description,
                sku: productData.sku,
                marcaId: marca.id,
                categoriaId: categoria.id,
                precioVenta: parseFloat(productData.price.regular.replace('$', '').replace('.', '')),
                precioOferta: productData.price.sale ? parseFloat(productData.price.sale.replace('$', '').replace('.', '')) : null,
                enOferta: productData.price.sale !== null,
                porcentajeDescuento: productData.price.sale ? Math.round(((parseFloat(productData.price.regular.replace('$', '').replace('.', '')) - parseFloat(productData.price.sale.replace('$', '').replace('.', ''))) / parseFloat(productData.price.regular.replace('$', '').replace('.', ''))) * 100) : null,
                imagenUrl: productData.imageUrl,
                productUrl: productData.productUrl,
                labels: productData.labels,
                enStock: productData.stock === 'instock'
              }
            });
          }
        }
      }
      
      logger.info('Sincronización de productos completada');
      return { success: true, message: 'Sincronización completada' };
    } catch (error) {
      logger.error('Error en la sincronización de productos:', error);
      throw error;
    }
  }
}

module.exports = new SaphirusSyncService(); 