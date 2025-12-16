// Config for Static or Local mode
const USE_STATIC_DATA = true; // Set to true for Netlify deployment
const API_URL = 'http://localhost:1337';

/**
 * Helper to get full image URL
 */
function getImageUrl(imageData) {
    if (!imageData) return 'assets/images/product_purple.png'; // Fallback

    const url = imageData.formats?.small?.url || imageData.url;

    if (USE_STATIC_DATA) {
        // In static mode, we replaced /uploads/ with assets/uploads/ in our JSON export
        // However, if the JSON still has the raw path from export script, we might handle it here too
        // But our export script kept the path as is? Wait, the export script had cleanData() but didn't actually use it on the values recursively.
        // Let's assume the JSON has raw paths "/uploads/foo.png".
        // We need to strip the domain and map to local assets.
        return `/assets${url}`;
        // Note: The export script didn't recursively clean the JSON, so paths are likely "/uploads/file.png".
        // We want "assets/uploads/file.png".
    }

    return `${API_URL}${url}`;
}

/**
 * Fetch all categories with their products
 */
async function fetchCategoriesWithProducts() {
    try {
        const url = USE_STATIC_DATA ? '/assets/data/categories.json' : `${API_URL}/api/categories?populate[products][populate]=image&sort=order:asc`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data; // Strapi format { data: [...] }
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
        const url = USE_STATIC_DATA ? '/assets/data/products.json' : `${API_URL}/api/products?populate=*`;
        const response = await fetch(url);
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
        const url = USE_STATIC_DATA ? '/assets/data/articles.json' : `${API_URL}/api/articles?populate=*&sort=publishedAt:desc`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

window.StrapiAPI = {
    getImageUrl,
    fetchCategoriesWithProducts,
    fetchProducts,
    fetchArticles
};
