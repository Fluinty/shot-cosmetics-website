/**
 * Shot Cosmetics — Strapi API Client
 * Connects to the live Strapi CMS on Railway
 */

const STRAPI_URL = 'https://hairpassion-production.up.railway.app';
const API = `${STRAPI_URL}/api`;

/**
 * Convert CMS rich text (markdown + inline HTML) to rendered HTML.
 * Handles: **bold**, *italic*, <u>underline</u>, \n → <br>
 */
function renderRichText(text) {
    if (!text) return '';
    let html = text;
    // Preserve existing HTML tags (they pass through)
    // Convert markdown bold **text** → <strong>text</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert markdown bold __text__ → <strong>text</strong>
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Convert markdown italic *text* → <em>text</em>
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Convert markdown italic _text_ → <em>text</em>
    html = html.replace(/(?<![a-zA-Z0-9])_(?!_)(.+?)(?<!_)_(?![a-zA-Z0-9_])/g, '<em>$1</em>');
    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');
    return html;
}

/**
 * Generic fetch helper with error handling and caching
 */
const _cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function strapiFetch(endpoint) {
    const cached = _cache[endpoint];
    if (cached && (Date.now() - cached.time < CACHE_TTL)) return cached.data;
    try {
        const response = await fetch(`${API}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        _cache[endpoint] = { data: json.data, time: Date.now() };
        return json.data;
    } catch (error) {
        console.error(`[StrapiAPI] Error fetching ${endpoint}:`, error);
        // Return stale cache if available
        if (cached) return cached.data;
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
    // Deep populate products explicitly to get images
    const query = `populate[products][populate][0]=image&populate[category]=true&pagination[pageSize]=100&sort=sort_order:asc`;
    const data = await strapiFetch(`/product-subcategories?${query}`);
    if (!data) return [];
    if (categorySlug) {
        return data.filter(s => s.category && s.category.slug === categorySlug);
    }
    return data;
}

async function fetchProductsByCategory(categorySlug) {
    const data = await strapiFetch(`/products?populate=*&pagination[pageSize]=100&sort=sort_order:asc&filters[category][slug][$eq]=${categorySlug}`);
    return data || [];
}

async function fetchAllProducts() {
    const data = await strapiFetch('/products?populate=*&pagination[pageSize]=100&sort=sort_order:asc');
    return data || [];
}

async function fetchProductBySlug(slug) {
    const data = await strapiFetch(`/products?filters[slug][$eq]=${slug}&populate=*`);
    return data && data.length > 0 ? data[0] : null;
}

async function fetchProductById(documentId) {
    const data = await strapiFetch(`/products/${documentId}?populate=*`);
    return data || null;
}

function getFileUrl(fileData) {
    if (!fileData) return null;
    const url = fileData.url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${STRAPI_URL}${url}`;
}

async function fetchBestsellers(limit = 3) {
    // Try bestsellers first
    let data = await strapiFetch(`/products?populate=*&filters[is_bestseller][$eq]=true&pagination[limit]=${limit}&sort=sort_order:asc`);
    if (data && data.length > 0) return data;
    // Fallback: return first N products
    data = await strapiFetch(`/products?populate=*&pagination[limit]=${limit}&sort=sort_order:asc`);
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

async function fetchEventById(documentId) {
    return await strapiFetch(`/education-events/${documentId}?populate=*`);
}

async function fetchEducators() {
    const data = await strapiFetch('/educators?populate=*');
    return data || [];
}

async function fetchEducationPage() {
    return await strapiFetch('/education-page?populate[0]=hero_image&populate[1]=program_image&populate[2]=program_features');
}

// ─── DISTRIBUTORS ─────────────────────────────────────────────────

async function fetchDistributors() {
    const data = await strapiFetch('/regional-distributors?populate[0]=representatives&pagination[pageSize]=100');
    return data || [];
}

// ─── SINGLE TYPES (Page Content) ─────────────────────────────────

async function fetchHomepageHero() {
    return await strapiFetch('/homepage-hero?populate=*');
}

async function fetchHomepageAbout() {
    return await strapiFetch('/homepage-about?populate[0]=stats&populate[1]=image');
}

async function fetchAboutPage() {
    return await strapiFetch('/about-page?populate[0]=history_image&populate[1]=hero_image&populate[2]=values&populate[3]=values.icon');
}

async function fetchContactInfo() {
    return await strapiFetch('/contact-info?populate=*');
}

async function fetchProductsPage() {
    return await strapiFetch('/products-page?populate=*');
}
async function fetchNewsPage() {
    return await strapiFetch('/news-page?populate=*');
}

// ─── TRAININGS ────────────────────────────────────────────────────
async function fetchTrainings() {
    const data = await strapiFetch('/trainings?populate=*&sort=title:asc');
    return data || [];
}

async function fetchTrainingById(documentId) {
    return await strapiFetch(`/trainings/${documentId}?populate=*`);
}

// ─── EXPORT ───────────────────────────────────────────────────────

window.StrapiAPI = {
    STRAPI_URL,
    getImageUrl,
    fetchCategories,
    fetchSubcategories,
    fetchProductsByCategory,
    fetchAllProducts,
    fetchProductBySlug,
    fetchProductById,
    getFileUrl,
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
    fetchContactInfo,
    fetchProductsPage,
    fetchNewsPage,
    fetchEventById,
    fetchTrainings,
    fetchTrainingById
};
