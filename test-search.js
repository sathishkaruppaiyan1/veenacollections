import fs from 'fs';
import fetch from 'node-fetch';

const WP_CONFIG = {
  SITE_URL: 'https://admin.theveenacollections.com',
  CONSUMER_KEY: 'ck_9e2a74de176bb39930b1484a5c061af4b962d7cc',
  CONSUMER_SECRET: 'cs_ace993e01a48ed2e715318479d0b2dd4d040bd67',
};
const API_BASE = `${WP_CONFIG.SITE_URL}/wp-json`;
const getAuthParams = () => `consumer_key=${WP_CONFIG.CONSUMER_KEY}&consumer_secret=${WP_CONFIG.CONSUMER_SECRET}`;

async function testSearch(query) {
  try {
    const [searchResponse, skuResponse] = await Promise.all([
      fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&search=${encodeURIComponent(query)}&per_page=5`),
      fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&sku=${encodeURIComponent(query)}&per_page=5`)
    ]);
    
    let allData = [];
    if (searchResponse.ok) {
      allData = [...allData, ...(await searchResponse.json())];
    } else {
        console.log("searchResponse not ok:", searchResponse.status);
    }
    if (skuResponse.ok) {
      allData = [...allData, ...(await skuResponse.json())];
    } else {
        console.log("skuResponse not ok:", skuResponse.status);
    }

    const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());
    console.log(`Found ${uniqueData.length} unique products for "${query}"`);
    if(uniqueData.length > 0) {
        console.log("First product name:", uniqueData[0].name);
    }
  } catch (err) {
    console.error(err);
  }
}

testSearch('saree');
testSearch('123');
