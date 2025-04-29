const axios = require('axios');
const cheerio = require('cheerio');

class SaphirusScraper {
    constructor() {
        this.baseUrl = 'https://www.saphirus.com.ar/tienda';
        this.productsPerPage = 24;
        // Configurar axios con timeout y headers
        this.axiosInstance = axios.create({
            timeout: 30000, // 30 segundos de timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
    }

    async getBrands() {
        try {
            console.log('Obteniendo marcas disponibles...');
            const response = await this.axiosInstance.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            const brands = new Set();
            
            // Buscar en los filtros de marca
            $('.widget_layered_nav li a').each((index, element) => {
                const brand = $(element).text().trim();
                if (brand) {
                    brands.add(brand);
                }
            });
            
            // Buscar en los productos
            $('.wd-product-brands-links a').each((index, element) => {
                const brand = $(element).text().trim();
                if (brand) {
                    brands.add(brand);
                }
            });
            
            // Buscar en los atributos de marca
            $('[data-marca]').each((index, element) => {
                const brand = $(element).attr('data-marca');
                if (brand) {
                    brands.add(brand);
                }
            });
            
            // Buscar en los enlaces de marca
            $('a[href*="marca="]').each((index, element) => {
                const brand = $(element).text().trim();
                if (brand) {
                    brands.add(brand);
                }
            });
            
            // Convertir Set a Array y ordenar
            const brandsArray = Array.from(brands).sort();
            
            console.log('Marcas encontradas:', brandsArray);
            return brandsArray;
        } catch (error) {
            console.error('Error al obtener las marcas:', error.message);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }

    async getTotalPages() {
        try {
            console.log('Obteniendo total de páginas...');
            const response = await this.axiosInstance.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            // Buscar el elemento que contiene el total de productos
            const totalProductsText = $('.woocommerce-result-count').text();
            console.log('Texto de total de productos:', totalProductsText);
            
            const totalProducts = parseInt(totalProductsText.match(/\d+/)[0]);
            
            // Buscar la paginación
            const pagination = $('.woocommerce-pagination');
            console.log('HTML de paginación:', pagination.html());
            
            const lastPageLink = pagination.find('a.page-numbers:not(.next)').last();
            const totalPages = lastPageLink.length ? parseInt(lastPageLink.text()) : 1;
            
            console.log(`Total de productos: ${totalProducts}`);
            console.log(`Total de páginas detectadas: ${totalPages}`);
            
            return totalPages;
        } catch (error) {
            console.error('Error al obtener el total de páginas:', error.message);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }

    async scrapePage(pageNumber) {
        try {
            const url = `${this.baseUrl}/page/${pageNumber}`;
            console.log(`Scrapeando URL: ${url}`);
            
            const response = await this.axiosInstance.get(url);
            console.log(`Respuesta recibida para página ${pageNumber}`);
            
            const $ = cheerio.load(response.data);
            const products = [];
            
            // Iterar sobre cada producto en la página
            $('.wd-product').each((index, element) => {
                const $product = $(element);
                
                // Obtener el nombre del producto
                const name = $product.find('.wd-entities-title a').text().trim();
                
                // Obtener la marca
                const brand = $product.find('.wd-product-brands-links a').text().trim();
                
                // Obtener el precio
                const price = $product.find('.price .woocommerce-Price-amount').text().trim();
                
                // Obtener la URL de la imagen
                const imageUrl = $product.find('.product-image-link img').attr('src');
                
                // Obtener la URL del producto
                const productUrl = $product.find('.product-image-link').attr('href');
                
                // Obtener el SKU del botón de añadir al carrito
                const sku = $product.find('.add_to_cart_button').attr('data-product_sku');
                
                // Obtener el ID del producto
                const productId = $product.find('.add_to_cart_button').attr('data-product_id');
                
                // Obtener la categoría
                const category = $product.find('.product_cat').text().trim();
                
                // Obtener el estado del stock
                const stock = $product.find('.stock').text().trim() || 'instock';
                
                // Obtener las etiquetas (labels)
                const labels = [];
                $product.find('.berocket_better_labels .br_alabel').each((i, label) => {
                    labels.push($(label).text().trim());
                });
                
                const product = {
                    id: productId,
                    name,
                    brand,
                    price,
                    imageUrl,
                    productUrl,
                    sku,
                    category,
                    stock,
                    labels
                };
                
                products.push(product);
            });
            
            console.log(`Productos encontrados en la página ${pageNumber}: ${products.length}`);
            return products;
        } catch (error) {
            console.error(`Error al scrapear la página ${pageNumber}:`, error.message);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }

    async scrapeAllProducts() {
        try {
            const totalPages = await this.getTotalPages();
            console.log(`Total de páginas a scrapear: ${totalPages}`);
            
            let allProducts = [];
            
            for (let page = 1; page <= totalPages; page++) {
                console.log(`Scrapeando página ${page} de ${totalPages}`);
                const pageProducts = await this.scrapePage(page);
                allProducts = allProducts.concat(pageProducts);
                
                // Agregar un pequeño delay para no sobrecargar el servidor
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log(`Total de productos scrapeados: ${allProducts.length}`);
            return allProducts;
        } catch (error) {
            console.error('Error al scrapear todos los productos:', error.message);
            throw error;
        }
    }

    async getBrandsWithCategories() {
        try {
            console.log('Obteniendo estructura de marcas y categorías...');
            const response = await this.axiosInstance.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            const brandsStructure = [];
            
            // Procesar cada marca principal (elementos cat-parent)
            $('.product-categories > .cat-item.cat-parent').each((index, element) => {
                const $brand = $(element);
                const brandName = $brand.find('> a').text().trim();
                const brandUrl = $brand.find('> a').attr('href');
                const categories = [];
                
                // Procesar las categorías de cada marca
                $brand.find('> ul.children > li.cat-item').each((i, catElement) => {
                    const $category = $(catElement);
                    categories.push({
                        name: $category.find('> a').text().trim(),
                        url: $category.find('> a').attr('href')
                    });
                });
                
                brandsStructure.push({
                    name: brandName,
                    url: brandUrl,
                    categories: categories
                });
            });
            
            console.log('Estructura de marcas y categorías encontrada:', JSON.stringify(brandsStructure, null, 2));
            return brandsStructure;
        } catch (error) {
            console.error('Error al obtener la estructura de marcas y categorías:', error.message);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }

    async getProductsByCategory(brand, category) {
        try {
            console.log(`Obteniendo productos para marca: ${brand}, categoría: ${category}`);
            
            // Construir la URL de la categoría con vista de lista para obtener descripciones
            const categoryUrl = `https://saphirus.com.ar/productos/${brand}/${category}/?shop_view=list`;
            console.log(`URL de categoría: ${categoryUrl}`);
            
            const response = await this.axiosInstance.get(categoryUrl);
            const $ = cheerio.load(response.data);
            
            // Obtener el total de páginas de la paginación
            const pagination = $('.woocommerce-pagination .page-numbers');
            const totalPages = pagination.find('li:not(:last-child)').length;
            
            console.log(`Total de páginas detectadas: ${totalPages}`);
            
            let allProducts = [];
            
            // Iterar sobre cada página
            for (let page = 1; page <= totalPages; page++) {
                console.log(`Obteniendo página ${page} de ${totalPages}`);
                
                // Si no es la primera página, hacer la petición a la página correspondiente
                const pageUrl = page === 1 ? categoryUrl : `${categoryUrl}&paged=${page}`;
                const pageResponse = await this.axiosInstance.get(pageUrl);
                const $page = cheerio.load(pageResponse.data);
                
                // Iterar sobre cada producto en la página
                $page('.wd-product').each((index, element) => {
                    const $product = $page(element);
                    
                    // Obtener el nombre del producto
                    const name = $product.find('.wd-entities-title a').text().trim();
                    
                    // Obtener la marca
                    const productBrand = $product.find('.wd-product-brands-links a').text().trim();
                    
                    // Obtener el precio
                    const price = $product.find('.price .woocommerce-Price-amount').text().trim();
                    
                    // Obtener la URL de la imagen
                    const imageUrl = $product.find('.product-image-link img').attr('src');
                    
                    // Obtener la URL del producto
                    const productUrl = $product.find('.product-image-link').attr('href');
                    
                    // Obtener el SKU del botón de añadir al carrito
                    const sku = $product.find('.add_to_cart_button').attr('data-product_sku');
                    
                    // Obtener el ID del producto
                    const productId = $product.find('.add_to_cart_button').attr('data-product_id');
                    
                    // Obtener el estado del stock
                    const stock = $product.find('.stock').text().trim() || 'instock';
                    
                    // Obtener las etiquetas (labels)
                    const labels = [];
                    $product.find('.berocket_better_labels .br_alabel').each((i, label) => {
                        labels.push($page(label).text().trim());
                    });
                    
                    // Obtener la descripción del producto
                    const description = $product.find('.woocommerce-product-details__short-description').text().trim();
                    
                    const product = {
                        id: productId,
                        name,
                        brand: productBrand,
                        price,
                        imageUrl,
                        productUrl,
                        sku,
                        category,
                        stock,
                        labels,
                        description
                    };
                    
                    allProducts.push(product);
                });
                
                // Agregar un pequeño delay para no sobrecargar el servidor
                if (page < totalPages) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log(`Total de productos encontrados: ${allProducts.length}`);
            
            return {
                brand,
                category,
                products: allProducts,
                total: allProducts.length,
                totalPages,
                productsPerPage: this.productsPerPage
            };
        } catch (error) {
            console.error(`Error al obtener productos para marca ${brand}, categoría ${category}:`, error.message);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }
}

module.exports = new SaphirusScraper(); 