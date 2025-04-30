// backend/src/services/scraper.service.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Producto, Marca, Categoria, Fragancia, Notificacion, sequelize } = require('../models');
const logger = require('../config/logger');

class ScraperService {
  constructor() {
    this.baseUrl = 'https://saphirus.com.ar';
    this.categoriesUrl = `${this.baseUrl}/productos`;
  }

  /**
   * Descargar y guardar una imagen desde una URL
   */
  async descargarImagen(url, nombreProducto) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });

      const extension = path.extname(url) || '.jpg';
      const nombreArchivo = `${uuidv4()}${extension}`;
      const rutaGuardado = path.join(__dirname, '../../uploads/productos', nombreArchivo);
      
      // Asegurar que el directorio existe
      const dir = path.dirname(rutaGuardado);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(rutaGuardado, response.data);
      
      // Devolver ruta relativa para guardar en la base de datos
      return `/uploads/productos/${nombreArchivo}`;
    } catch (error) {
      logger.error(`Error al descargar imagen para ${nombreProducto}:`, error);
      return null;
    }
  }

  /**
   * Obtener todas las categorías de productos
   */
  async obtenerCategorias() {
    try {
      const response = await axios.get(this.categoriesUrl);
      const $ = cheerio.load(response.data);
      
      const categorias = [];
      
      // Ejemplo: buscar categorías en el menú de navegación (ajustar según estructura del sitio)
      $('.category-list a').each((index, element) => {
        const nombre = $(element).text().trim();
        const url = $(element).attr('href');
        
        if (nombre && url) {
          categorias.push({
            nombre,
            url: url.startsWith('/') ? this.baseUrl + url : url
          });
        }
      });
      
      return categorias;
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtener productos de una categoría específica
   */
  async obtenerProductosDeCategoria(categoriaUrl, categoriaNombre) {
    try {
      const response = await axios.get(categoriaUrl);
      const $ = cheerio.load(response.data);
      
      const productos = [];
      
      // Ejemplo: buscar productos en la página de categoría (ajustar según estructura del sitio)
      $('.product-item').each((index, element) => {
        const nombre = $(element).find('.product-name').text().trim();
        const descripcion = $(element).find('.product-description').text().trim();
        const precio = $(element).find('.product-price').text().trim()
          .replace('$', '').replace('.', '').replace(',', '.');
        const imagenUrl = $(element).find('.product-image img').attr('src');
        const enOferta = $(element).find('.discount-badge').length > 0;
        const enStock = !$(element).find('.out-of-stock').length > 0;
        const detalleUrl = $(element).find('a.product-link').attr('href');
        
        // Extraer el porcentaje de descuento si está en oferta
        let porcentajeDescuento = null;
        if (enOferta) {
          const descuentoText = $(element).find('.discount-badge').text().trim();
          const match = descuentoText.match(/(\d+)%/);
          if (match && match[1]) {
            porcentajeDescuento = parseInt(match[1], 10);
          }
        }
        
        productos.push({
          nombre,
          descripcion,
          precioVenta: parseFloat(precio),
          imagenUrl: imagenUrl.startsWith('/') ? this.baseUrl + imagenUrl : imagenUrl,
          enOferta,
          porcentajeDescuento,
          enStock,
          categoria: categoriaNombre,
          detalleUrl: detalleUrl.startsWith('/') ? this.baseUrl + detalleUrl : detalleUrl
        });
      });
      
      return productos;
    } catch (error) {
      logger.error(`Error al obtener productos de categoría ${categoriaNombre}:`, error);
      throw error;
    }
  }

  /**
   * Obtener detalles adicionales de un producto específico
   */
  async obtenerDetallesProducto(producto) {
    try {
      const response = await axios.get(producto.detalleUrl);
      const $ = cheerio.load(response.data);
      
      // Ejemplo: buscar detalles en la página del producto (ajustar según estructura del sitio)
      const fragancia = $('.product-fragrance').text().trim();
      const marca = $('.product-brand').text().trim();
      
      // Descripción más detallada si está disponible
      const descripcionDetallada = $('.product-description-full').text().trim() || producto.descripcion;
      
      return {
        ...producto,
        descripcion: descripcionDetallada,
        fragancia,
        marca
      };
    } catch (error) {
      logger.error(`Error al obtener detalles del producto ${producto.nombre}:`, error);
      // Si falla, devolver el producto original sin cambios
      return producto;
    }
  }

  /**
   * Ejecutar scraping completo
   */
        async ejecutarScrapingCompleto() {
            const transaction = await sequelize.transaction();
            
            try {
              logger.info('Iniciando proceso de scraping completo');
              
              // Obtener todas las categorías
              const categorias = await this.obtenerCategorias();
              logger.info(`Se encontraron ${categorias.length} categorías`);
              
              // Array para almacenar todos los productos encontrados
              const todosLosProductos = [];
              
              // Set para almacenar marcas y fragancias únicas
              const marcasSet = new Set();
              const fraganciasSet = new Set();
              
              // Recorrer cada categoría y obtener sus productos
              for (const categoria of categorias) {
                logger.info(`Procesando categoría: ${categoria.nombre}`);
                
                // Guardar o actualizar la categoría en la base de datos
                let categoriaDB = await Categoria.findOne({ 
                  where: { nombre: categoria.nombre }
                }, { transaction });
                
                if (!categoriaDB) {
                  categoriaDB = await Categoria.create({
                    nombre: categoria.nombre,
                    descripcion: `Categoría ${categoria.nombre} de Saphirus`
                  }, { transaction });
                  logger.info(`Categoría creada: ${categoria.nombre}`);
                }
                
                // Obtener productos de la categoría
                const productosCategoria = await this.obtenerProductosDeCategoria(
                  categoria.url, 
                  categoria.nombre
                );
                
                logger.info(`Se encontraron ${productosCategoria.length} productos en la categoría ${categoria.nombre}`);
                
                // Obtener detalles adicionales de cada producto
                for (const producto of productosCategoria) {
                  const productoDetallado = await this.obtenerDetallesProducto(producto);
                  
                  // Agregar al conjunto de marcas y fragancias
                  if (productoDetallado.marca) marcasSet.add(productoDetallado.marca);
                  if (productoDetallado.fragancia) fraganciasSet.add(productoDetallado.fragancia);
                  
                  // Agregar categoríaId
                  productoDetallado.categoriaId = categoriaDB.id;
                  
                  // Añadir a la lista de todos los productos
                  todosLosProductos.push(productoDetallado);
                }
              }
              
              // Convertir sets a arrays
              const marcasArray = Array.from(marcasSet);
              const fraganciasArray = Array.from(fraganciasSet);
              
              // Guardar marcas en la base de datos
              const marcasMap = new Map();
              for (const marcaNombre of marcasArray) {
                let marcaDB = await Marca.findOne({ 
                  where: { nombre: marcaNombre }
                }, { transaction });
                
                if (!marcaDB) {
                  marcaDB = await Marca.create({
                    nombre: marcaNombre,
                    descripcion: `Marca ${marcaNombre}`
                  }, { transaction });
                  logger.info(`Marca creada: ${marcaNombre}`);
                }
                
                marcasMap.set(marcaNombre, marcaDB.id);
              }
              
              // Guardar fragancias en la base de datos
              const fraganciasMap = new Map();
              for (const fraganciaNombre of fraganciasArray) {
                let fraganciaDB = await Fragancia.findOne({ 
                  where: { nombre: fraganciaNombre }
                }, { transaction });
                
                if (!fraganciaDB) {
                  fraganciaDB = await Fragancia.create({
                    nombre: fraganciaNombre,
                    descripcion: `Fragancia ${fraganciaNombre}`
                  }, { transaction });
                  logger.info(`Fragancia creada: ${fraganciaNombre}`);
                }
                
                fraganciasMap.set(fraganciaNombre, fraganciaDB.id);
              }
              
              // Resultados para comparar con la base de datos
              const resultados = {
                nuevos: [],
                modificados: [],
                sinStock: [],
                sinCambios: []
              };
              
              // Procesar todos los productos
              for (const productoScraped of todosLosProductos) {
                // Asignar IDs de relaciones
                if (productoScraped.marca) {
                  productoScraped.marcaId = marcasMap.get(productoScraped.marca);
                }
                
               
                // Buscar si el producto ya existe en la base de datos
                const productoExistente = await Producto.findOne({
                  where: { nombre: productoScraped.nombre },
                  include: [
                    { model: Marca, as: 'marca' },
                    { model: Categoria, as: 'categoria' },
                    { model: Fragancia, as: 'fragancia' }
                  ]
                }, { transaction });
                
                if (!productoExistente) {
                  // Producto nuevo
                  resultados.nuevos.push({
                    nombre: productoScraped.nombre,
                    precio: productoScraped.precioVenta,
                    enOferta: productoScraped.enOferta,
                    enStock: productoScraped.enStock
                  });
                  
                  // Crear notificación para nuevo producto
                  await Notificacion.create({
                    tipo: 'PRODUCTO_NUEVO',
                    mensaje: `Nuevo producto encontrado: ${productoScraped.nombre} - Precio: $${productoScraped.precioVenta}`,
                    leida: false
                  }, { transaction });
                } else {
                  // Producto existente, verificar cambios
                  const cambios = [];
                  
                  // Verificar cambio de precio
                  if (productoExistente.precioVenta !== productoScraped.precioVenta) {
                    cambios.push(`Precio: $${productoExistente.precioVenta} -> $${productoScraped.precioVenta}`);
                    
                    // Crear notificación para cambio de precio
                    await Notificacion.create({
                      tipo: 'CAMBIO_PRECIO',
                      mensaje: `Cambio de precio en ${productoScraped.nombre}: $${productoExistente.precioVenta} -> $${productoScraped.precioVenta}`,
                      productoId: productoExistente.id,
                      leida: false
                    }, { transaction });
                  }
                  
                  // Verificar cambio de disponibilidad
                  if (productoExistente.enStock !== productoScraped.enStock) {
                    cambios.push(`Disponibilidad: ${productoExistente.enStock ? 'En stock' : 'Sin stock'} -> ${productoScraped.enStock ? 'En stock' : 'Sin stock'}`);
                    
                    if (!productoScraped.enStock) {
                      resultados.sinStock.push({
                        nombre: productoScraped.nombre,
                        precio: productoScraped.precioVenta
                      });
                    }
                  }
                  
                  // Verificar cambio en oferta
                  if (productoExistente.enOferta !== productoScraped.enOferta) {
                    cambios.push(`Oferta: ${productoExistente.enOferta ? 'Sí' : 'No'} -> ${productoScraped.enOferta ? 'Sí' : 'No'}`);
                  }
                  
                  if (cambios.length > 0) {
                    resultados.modificados.push({
                      nombre: productoScraped.nombre,
                      cambios
                    });
                  } else {
                    resultados.sinCambios.push({
                      nombre: productoScraped.nombre
                    });
                  }
                }
              }
              
              await transaction.commit();
              logger.info('Proceso de scraping completo finalizado exitosamente');
              
              return {
                fechaScraping: new Date(),
                estadisticas: {
                  totalProductos: todosLosProductos.length,
                  nuevos: resultados.nuevos.length,
                  modificados: resultados.modificados.length,
                  sinStock: resultados.sinStock.length,
                  sinCambios: resultados.sinCambios.length
                },
                resultados
              };
            } catch (error) {
              await transaction.rollback();
              logger.error('Error en el proceso de scraping completo:', error);
              throw error;
            }
          }
        
          /**
           * Sincronizar datos del scraping con la base de datos
           */
          async sincronizarDatos(datosScraped) {
            const transaction = await sequelize.transaction();
            
            try {
              logger.info('Iniciando sincronización de datos');
              
              // Procesar productos nuevos
              for (const productoNuevo of datosScraped.resultados.nuevos) {
                // Buscar el producto completo en el array original
                const productoCompleto = datosScraped.todosLosProductos.find(
                  p => p.nombre === productoNuevo.nombre
                );
                
                if (productoCompleto) {
                  // Descargar imagen si existe
                  let imagenUrlLocal = null;
                  if (productoCompleto.imagenUrl) {
                    imagenUrlLocal = await this.descargarImagen(
                      productoCompleto.imagenUrl,
                      productoCompleto.nombre
                    );
                  }
                  
                  // Crear producto en la base de datos
                  await Producto.create({
                    nombre: productoCompleto.nombre,
                    descripcion: productoCompleto.descripcion,
                    marcaId: productoCompleto.marcaId,
                    categoriaId: productoCompleto.categoriaId,
                    precioCompra: productoCompleto.precioVenta * 0.7, // Precio de compra estimado (70%)
                    precioVenta: productoCompleto.precioVenta,
                    stock: 0, // Inicialmente sin stock
                    stockMinimo: 3,
                    enOferta: productoCompleto.enOferta,
                    porcentajeDescuento: productoCompleto.porcentajeDescuento,
                    imagenUrl: imagenUrlLocal,
                    enStock: productoCompleto.enStock
                  }, { transaction });
                  
                  logger.info(`Producto nuevo creado: ${productoCompleto.nombre}`);
                }
              }
              
              // Procesar productos modificados
              for (const productoMod of datosScraped.resultados.modificados) {
                // Buscar el producto en la base de datos
                const productoDB = await Producto.findOne({
                  where: { nombre: productoMod.nombre }
                }, { transaction });
                
                if (productoDB) {
                  // Buscar el producto completo en el array original
                  const productoCompleto = datosScraped.todosLosProductos.find(
                    p => p.nombre === productoMod.nombre
                  );
                  
                  if (productoCompleto) {
                    // Actualizar producto
                    await productoDB.update({
                      descripcion: productoCompleto.descripcion,
                      marcaId: productoCompleto.marcaId,
                      categoriaId: productoCompleto.categoriaId,
                      precioVenta: productoCompleto.precioVenta,
                      enOferta: productoCompleto.enOferta,
                      porcentajeDescuento: productoCompleto.porcentajeDescuento,
                      enStock: productoCompleto.enStock
                    }, { transaction });
                    
                    logger.info(`Producto actualizado: ${productoCompleto.nombre}`);
                  }
                }
              }
              
              await transaction.commit();
              logger.info('Sincronización de datos completada exitosamente');
              
              return {
                mensaje: 'Sincronización completada exitosamente',
                estadisticas: {
                  nuevosCreados: datosScraped.resultados.nuevos.length,
                  modificadosActualizados: datosScraped.resultados.modificados.length
                }
              };
            } catch (error) {
              await transaction.rollback();
              logger.error('Error en la sincronización de datos:', error);
              throw error;
            }
          }
        }
        
        module.exports = new ScraperService();