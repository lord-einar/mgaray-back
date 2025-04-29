const cron = require('node-cron');
const saphirusSyncService = require('./saphirusSync.service');
const logger = require('../config/logger');

class ScheduledSyncService {
  constructor() {
    // Programar la tarea para que se ejecute todos los días a las 07:00
    this.syncJob = cron.schedule('0 7 * * *', async () => {
      try {
        logger.info('Iniciando sincronización programada de productos');
        await this.performSync();
      } catch (error) {
        logger.error('Error en la sincronización programada:', error);
      }
    });
  }

  async performSync() {
    try {
      // Obtener la estructura de marcas y categorías
      const brandsStructure = await saphirusSyncService.getBrandsWithCategories();
      
      for (const brand of brandsStructure) {
        for (const category of brand.categories) {
          // Obtener productos de esta marca y categoría
          const productsData = await saphirusSyncService.getProductsByCategory(brand.name, category.name);
          
          for (const productData of productsData.products) {
            // Verificar si el producto existe y necesita actualización
            const existingProduct = await saphirusSyncService.findProductBySku(productData.sku);
            
            if (existingProduct) {
              // Verificar si hay cambios
              const hasChanges = this.checkForChanges(existingProduct, productData);
              
              if (hasChanges) {
                // Actualizar el producto
                await saphirusSyncService.updateProduct(existingProduct.id, productData);
                logger.info(`Producto actualizado: ${productData.name}`);
              }
            } else {
              // Crear nuevo producto
              await saphirusSyncService.createProduct(productData);
              logger.info(`Nuevo producto creado: ${productData.name}`);
            }
          }
        }
      }
      
      logger.info('Sincronización programada completada');
    } catch (error) {
      logger.error('Error en la sincronización programada:', error);
      throw error;
    }
  }

  checkForChanges(existingProduct, newData) {
    return (
      existingProduct.nombre !== newData.name ||
      existingProduct.descripcion !== newData.description ||
      existingProduct.precioVenta !== parseFloat(newData.price.replace('$', '').replace('.', '')) ||
      existingProduct.imagenUrl !== newData.imageUrl ||
      existingProduct.enStock !== (newData.stock === 'instock') ||
      JSON.stringify(existingProduct.labels) !== JSON.stringify(newData.labels)
    );
  }

  start() {
    this.syncJob.start();
    logger.info('Servicio de sincronización programada iniciado');
  }

  stop() {
    this.syncJob.stop();
    logger.info('Servicio de sincronización programada detenido');
  }
}

module.exports = new ScheduledSyncService(); 