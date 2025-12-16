const fs = require('fs');
const http = require('http');
const path = require('path');

const API_URL = 'http://localhost:1337';
const OUTPUT_DIR = path.join(__dirname, '../assets/data');

if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        });
    });
};

const processData = async () => {
    try {
        console.log('Fetching Categories...');
        const categories = await fetchUrl(`${API_URL}/api/categories?populate[products][populate]=image&sort=order:asc`);
        
        console.log('Fetching Products...');
        const products = await fetchUrl(`${API_URL}/api/products?populate=*`);
        
        console.log('Fetching Articles...');
        const articles = await fetchUrl(`${API_URL}/api/articles?populate=*&sort=publishedAt:desc`);

        // Helper to replace upload URLs
        const cleanData = (dataStr) => {
            return dataStr.replace(/\/uploads\//g, 'assets/uploads/');
        };

        const save = (name, data) => {
            fs.writeFileSync(
                path.join(OUTPUT_DIR, `${name}.json`), 
                // We keep the structure { data: [...] } to match API response
                JSON.stringify(data, null, 2) 
            );
        };

        save('categories', categories);
        save('products', products);
        save('articles', articles);

        console.log('✅ Data exported successfully to assets/data/');
    } catch (error) {
        console.error('❌ Error exporting data:', error);
    }
};

processData();
