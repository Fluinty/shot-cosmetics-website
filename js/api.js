const STRAPI_URL = 'http://localhost:1337';

/**
 * Helper to get full image URL
 */
function getImageUrl(imageData) {
    if (!imageData) return 'assets/images/product_purple.png'; // Fallback image
    // If image has formats (small/medium/thumbnail), use small, otherwise original
    const url = imageData.formats?.small?.url || imageData.url;
    return `${STRAPI_URL}${url}`;
}

/**
 * Fetch all categories with their products
 */
async function fetchCategoriesWithProducts() {
    try {
        // Fetch categories and populate their products and product images
        const response = await fetch(`${STRAPI_URL}/api/categories?populate[products][populate]=image&sort=order:asc`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Fetch all products
 */
async function fetchProducts() {
    try {
        const response = await fetch(`${STRAPI_URL}/api/products?populate=*`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Fetch articles
 */
async function fetchArticles() {
    try {
        const response = await fetch(`${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// Export functions if using modules, or just expose to window
window.StrapiAPI = {
    STRAPI_URL,
    getImageUrl,
    fetchCategoriesWithProducts,
    fetchProducts,
    fetchArticles
};
