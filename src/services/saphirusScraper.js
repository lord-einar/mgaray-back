const axios = require('axios');
const cheerio = require('cheerio');

class SaphirusScraper {
    constructor() {
        this.baseUrl = 'https://www.saphirus.com.ar';
        this.productsPerPage = 24;
        this.maxRetries = 3;
        this.minDelay = 2000;
        this.maxDelay = 5000;
        
        // Configurar axios con timeout y headers
        this.axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomDelay() {
        return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
    }

    async retryRequest(url, maxRetries = this.maxRetries) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Intento ${attempt} de ${maxRetries} para URL: ${url}`);
                const response = await this.axiosInstance.get(url);
                return response;
            } catch (error) {
                lastError = error;
                console.log(`Error en intento ${attempt}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = this.getRandomDelay() * attempt; // Incrementar delay con cada intento
                    console.log(`Esperando ${delay}ms antes del siguiente intento...`);
                    await this.sleep(delay);
                }
            }
        }
        throw lastError;
    }

    async getCategories() {
        try {
            console.log('Obteniendo categorías...');
            const response = await this.retryRequest(`${this.baseUrl}/tienda`);
            const $ = cheerio.load(response.data);
            
            const categories = [];
            
            // Procesar cada marca principal y sus categorías
            $('.product-categories > .cat-item').each((_, brandElement) => {
                const $brand = $(brandElement);
                const brandName = $brand.find('> a').text().trim();
                
                // Procesar las categorías de cada marca
                $brand.find('> ul.children > li.cat-item').each((_, catElement) => {
                    const $category = $(catElement);
                    const categoryName = $category.find('> a').text().trim();
                    const categoryUrl = $category.find('> a').attr('href');
                    
                    categories.push({
                        brand: brandName,
                        name: categoryName,
                        url: categoryUrl,
                        fullPath: `${brandName} > ${categoryName}`
                    });
                });
            });
            
            return categories;
        } catch (error) {
            console.error('Error al obtener categorías:', error.message);
            throw error;
        }
    }

    async scrapeProductsFromCategory(categoryUrl, categoryName) {
        try {
            let allProducts = [];
            let currentPage = 1;
            let hasNextPage = true;
            
            while (hasNextPage) {
                const pageUrl = `${categoryUrl}${currentPage > 1 ? `page/${currentPage}/` : ''}?per_row=3&shop_view=list`;
                console.log(`Scrapeando página ${currentPage} de la categoría: ${pageUrl}`);
                
                await this.sleep(this.getRandomDelay());
                const response = await this.retryRequest(pageUrl);
                const $ = cheerio.load(response.data);
                
                $('.product-grid-item').each((_, element) => {
                    const $product = $(element);
                    
                    // Extraer información del producto
                    const productId = $product.attr('data-id');
                    const name = $product.find('.wd-entities-title a').text().trim();
                    const description = $product.find('.woocommerce-product-details__short-description p').text().trim();
                    const imageUrl = $product.find('.product-image-link img').attr('src');
                    const productUrl = $product.find('.product-image-link').attr('href');
                    
                    // Procesar precios
                    const $price = $product.find('.price');
                    const prices = $price.find('.woocommerce-Price-amount').map((_, el) => 
                        $(el).text().trim()
                    ).get();
                    
                    const isOnSale = $price.find('.woocommerce-Price-amount').length > 1;
                    const price = {
                        regular: isOnSale ? prices[0] : prices[0],
                        sale: isOnSale ? prices[1] : null
                    };
                    
                    // Verificar stock y etiquetas
                    const inStock = !$product.find('.out-of-stock').length;
                    const isNew = $product.find('.berocket_better_labels .br_alabel:contains("SALE")').length > 0;
                    
                    allProducts.push({
                        id: productId,
                        name,
                        description,
                        imageUrl,
                        productUrl,
                        price,
                        isOnSale,
                        inStock,
                        isNew,
                        category: categoryName,
                        sku: $product.find('.add_to_cart_button').attr('data-product_sku'),
                        stock: inStock ? 'instock' : 'outofstock'
                    });
                });
                
                // Verificar si hay siguiente página
                hasNextPage = !!$('.woocommerce-pagination .next').length;
                currentPage++;
                
                // Pequeña pausa entre páginas
                if (hasNextPage) {
                    await this.sleep(this.getRandomDelay());
                }
            }
            
            return allProducts;
        } catch (error) {
            console.error('Error al scrapear productos de categoría:', error.message);
            throw error;
        }
    }

    async scrapeAllProducts() {
        try {
            const categories = await this.getCategories();
            console.log(`Se encontraron ${categories.length} categorías`);
            
            const allProducts = [];
            const failedCategories = [];
            
            for (const category of categories) {
                try {
                    console.log(`Procesando categoría: ${category.fullPath}`);
                    const products = await this.scrapeProductsFromCategory(category.url, category.name);
                    
                    // Añadir información de marca y categoría a cada producto
                    products.forEach(product => {
                        product.brand = category.brand;
                        product.categoryFullPath = category.fullPath;
                    });
                    
                    allProducts.push(...products);
                    console.log(`Se encontraron ${products.length} productos en ${category.fullPath}`);
                    
                    // Pausa entre categorías
                    await this.sleep(this.getRandomDelay());
                } catch (error) {
                    console.error(`Error al procesar categoría ${category.fullPath}:`, error.message);
                    failedCategories.push(category);
                }
            }
            
            // Intentar recuperar categorías fallidas
            if (failedCategories.length > 0) {
                console.log(`Reintentando ${failedCategories.length} categorías fallidas...`);
                for (const category of failedCategories) {
                    try {
                        const products = await this.scrapeProductsFromCategory(category.url, category.name);
                        products.forEach(product => {
                            product.brand = category.brand;
                            product.categoryFullPath = category.fullPath;
                        });
                        allProducts.push(...products);
                    } catch (error) {
                        console.error(`Error en reintento de categoría ${category.fullPath}:`, error.message);
                    }
                }
            }
            
            return allProducts;
        } catch (error) {
            console.error('Error al scrapear todos los productos:', error.message);
            throw error;
        }
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
            
            // Añadir delay aleatorio antes de cada petición
            const delay = this.getRandomDelay();
            console.log(`Esperando ${delay}ms antes de hacer la petición...`);
            await this.sleep(delay);
            
            const response = await this.retryRequest(url);
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
                const priceElement = $product.find('.price');
                let regularPrice = '';
                let salePrice = '';
                
                // Verificar si hay precio de oferta
                const hasSalePrice = priceElement.find('.woocommerce-Price-amount').length > 1;
                
                if (hasSalePrice) {
                    // Si hay oferta, el primer precio es el regular y el segundo es el de oferta
                    regularPrice = priceElement.find('.woocommerce-Price-amount').first().text().trim();
                    salePrice = priceElement.find('.woocommerce-Price-amount').last().text().trim();
                } else {
                    // Si no hay oferta, solo hay un precio
                    regularPrice = priceElement.find('.woocommerce-Price-amount').text().trim();
                }
                
                const price = {
                    regular: regularPrice,
                    sale: salePrice || null
                };
                
                // Obtener la URL de la imagen
                const imageUrl = $product.find('.product-image-link img').attr('src');
                
                // Obtener la URL del producto
                const productUrl = $product.find('.product-image-link').attr('href');
                
                // Obtener el SKU del botón de añadir al carrito
                const sku = $product.find('.add_to_cart_button').attr('data-product_sku');
                
                // Obtener el ID del producto
                const productId = $product.find('.add_to_cart_button').attr('data-product_id');
                
                // Obtener la categoría
                let category = '';
                
                // Intentar obtener la categoría del menú de navegación
                const categoryElement = $product.closest('.product-category');
                if (categoryElement.length) {
                    category = categoryElement.find('h2.woocommerce-loop-category__title').text().trim();
                }
                
                // Si no se encuentra en el elemento de categoría, buscar en los enlaces de producto
                if (!category) {
                    const productLinks = $product.find('a[href*="/categoria-producto/"]');
                    if (productLinks.length) {
                        const categoryUrl = productLinks.attr('href');
                        const categoryMatch = categoryUrl.match(/categoria-producto\/([^/]+)/);
                        if (categoryMatch) {
                            category = decodeURIComponent(categoryMatch[1])
                                .replace(/-/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        }
                    }
                }
                
                // Si aún no se encuentra, buscar en los breadcrumbs o navegación
                if (!category) {
                    const breadcrumbs = $('.woocommerce-breadcrumb a, .breadcrumb a');
                    if (breadcrumbs.length > 1) {
                        category = $(breadcrumbs[1]).text().trim();
                    }
                }
                
                // Si todavía no hay categoría, intentar obtenerla de la URL del producto
                if (!category) {
                    const productUrl = $product.find('.product-image-link').attr('href');
                    if (productUrl) {
                        const urlParts = productUrl.split('/');
                        const categoryIndex = urlParts.indexOf('categoria-producto');
                        if (categoryIndex !== -1 && urlParts[categoryIndex + 1]) {
                            category = decodeURIComponent(urlParts[categoryIndex + 1])
                                .replace(/-/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        }
                    }
                }
                
                // Si aún no hay categoría, usar una por defecto
                if (!category) {
                    category = 'Sin Categoría';
                }
                
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
            const categoryUrl = `${this.baseUrl}/?marca=${encodeURIComponent(brand)}&product_cat=${encodeURIComponent(category)}&shop_view=list`;
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
                    const priceElement = $product.find('.price');
                    let regularPrice = '';
                    let salePrice = '';
                    
                    // Verificar si hay precio de oferta
                    const hasSalePrice = priceElement.find('.woocommerce-Price-amount').length > 1;
                    
                    if (hasSalePrice) {
                        // Si hay oferta, el primer precio es el regular y el segundo es el de oferta
                        regularPrice = priceElement.find('.woocommerce-Price-amount').first().text().trim();
                        salePrice = priceElement.find('.woocommerce-Price-amount').last().text().trim();
                    } else {
                        // Si no hay oferta, solo hay un precio
                        regularPrice = priceElement.find('.woocommerce-Price-amount').text().trim();
                    }
                    
                    const price = {
                        regular: regularPrice,
                        sale: salePrice || null
                    };
                    
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