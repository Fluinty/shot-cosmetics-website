/**
 * Shot Cosmetics — Strapi API Client
 * Connects to the live Strapi CMS on Railway
 */

const STRAPI_URL = 'https://hairpassion-production.up.railway.app';
const API = `${STRAPI_URL}/api`;

/**
 * Generic fetch helper with error handling and caching
 */
const _cache = {};
async function strapiFetch(endpoint) {
    if (_cache[endpoint]) return _cache[endpoint];
    try {
        const response = await fetch(`${API}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        _cache[endpoint] = json.data;
        return json.data;
    } catch (error) {
        console.error(`[StrapiAPI] Error fetching ${endpoint}:`, error);
        return null;
    }
}

/**
 * Get full image URL from Strapi media object
 */
function getImageUrl(imageData) {
    if (!imageData) return null;
    const url = imageData.formats?.medium?.url || imageData.formats?.small?.url || imageData.url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${STRAPI_URL}${url}`;
}

// ─── PRODUCTS & CATEGORIES ────────────────────────────────────────

async function fetchCategories() {
    const data = await strapiFetch('/product-categories?sort=sort_order:asc');
    return data || [];
}

async function fetchSubcategories(categorySlug) {
    const data = await strapiFetch(`/product-subcategories?populate=products&populate=category&pagination[pageSize]=100&sort=sort_order:asc`);
    if (!data) return [];
    if (categorySlug) {
        return data.filter(s => s.category && s.category.slug === categorySlug);
    }
    return data;
}

async function fetchProductsByCategory(categorySlug) {
    const data = await strapiFetch(`/products?populate=category&pagination[pageSize]=100&sort=sort_order:asc&filters[category][slug][$eq]=${categorySlug}`);
    return data || [];
}

async function fetchAllProducts() {
    const data = await strapiFetch('/products?populate=category&pagination[pageSize]=100&sort=sort_order:asc');
    return data || [];
}

async function fetchBestsellers(limit = 3) {
    // Try bestsellers first
    let data = await strapiFetch(`/products?populate=category&populate=image&filters[is_bestseller][$eq]=true&pagination[limit]=${limit}&sort=sort_order:asc`);
    if (data && data.length > 0) return data;
    // Fallback: return first N products
    data = await strapiFetch(`/products?populate=category&populate=image&pagination[limit]=${limit}&sort=sort_order:asc`);
    return data || [];
}

/**
 * Fetch full category data with products organized by subcategories
 * Returns: { category, products, subcategories: [{ ...sub, products: [...] }] }
 */
async function fetchCategoryFull(categorySlug) {
    const [categories, subcategories, products] = await Promise.all([
        fetchCategories(),
        fetchSubcategories(categorySlug),
        fetchProductsByCategory(categorySlug)
    ]);

    const category = categories.find(c => c.slug === categorySlug);

    if (subcategories.length > 0) {
        // Category with subcategories (like Pielęgnacja)
        return { category, products: [], subcategories };
    } else {
        // Category with direct products (like Koloryzacja)
        return { category, products, subcategories: [] };
    }
}

// ─── NEWS ARTICLES ────────────────────────────────────────────────

async function fetchArticles(limit) {
    const qs = limit ? `&pagination[limit]=${limit}` : '&pagination[pageSize]=100';
    const data = await strapiFetch(`/news-articles?populate=*&sort=published_date:desc${qs}`);
    return data || [];
}

async function fetchArticleBySlug(slug) {
    const data = await strapiFetch(`/news-articles?filters[slug][$eq]=${slug}&populate=*`);
    return data && data.length > 0 ? data[0] : null;
}

// ─── EDUCATION ────────────────────────────────────────────────────

async function fetchEducationEvents() {
    const data = await strapiFetch('/education-events?populate=*&sort=date:asc');
    return data || [];
}

async function fetchEducators() {
    const data = await strapiFetch('/educators?populate=*');
    return data || [];
}

async function fetchEducationPage() {
    return await strapiFetch('/education-page?populate=*');
}

// ─── DISTRIBUTORS ─────────────────────────────────────────────────

async function fetchDistributors() {
    const data = await strapiFetch('/regional-distributors?populate[representatives]=*&pagination[pageSize]=100');
    return data || [];
}

// ─── SINGLE TYPES (Page Content) ─────────────────────────────────

async function fetchHomepageHero() {
    return await strapiFetch('/homepage-hero?populate=*');
}

async function fetchHomepageAbout() {
    return await strapiFetch('/homepage-about?populate[stats]=*&populate[image]=*');
}

async function fetchAboutPage() {
    return await strapiFetch('/about-page?populate[history_image]=*&populate[values][populate][icon]=*');
}

async function fetchContactInfo() {
    return await strapiFetch('/contact-info?populate=*');
}

// ─── EXPORT ───────────────────────────────────────────────────────

window.StrapiAPI = {
    STRAPI_URL,
    getImageUrl,
    fetchCategories,
    fetchSubcategories,
    fetchProductsByCategory,
    fetchAllProducts,
    fetchBestsellers,
    fetchCategoryFull,
    fetchArticles,
    fetchArticleBySlug,
    fetchEducationEvents,
    fetchEducators,
    fetchEducationPage,
    fetchDistributors,
    fetchHomepageHero,
    fetchHomepageAbout,
    fetchAboutPage,
    fetchContactInfo
};
