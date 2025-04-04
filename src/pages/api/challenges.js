// pages/api/challenges.js
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Configuración CORS
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

// Helper function to create a WooCommerce API instance
const createWooCommerceApi = (url, consumerKey, consumerSecret, version = 'wc/v3') => {
  if (!url) throw new Error('URL no proporcionada para WooCommerce API');
  if (!consumerKey || !consumerSecret) {
    throw new Error('Credenciales de WooCommerce no proporcionadas (consumerKey o consumerSecret)');
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version,
    timeout: 10000,
  });
};

// Fetcher function for WooCommerce API
const wooFetcher = async (endpoint) => {
  const url = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WP_URL;
  const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
  const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

  const api = createWooCommerceApi(url, consumerKey, consumerSecret);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const response = await api.get(cleanEndpoint);
  return response.data;
};

// Fetch data from Strapi directly
async function fetchStrapiData(endpoint) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
  const STRAPI_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

  const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching Strapi data: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Respuesta de Strapi para ${endpoint}:`, JSON.stringify(data, null, 2));
  return data.data;
}

// Función para procesar datos de Strapi y WooCommerce
async function getChallengeData() {
  const relations = await fetchStrapiData('challenge-relations?populate=*');
  const allproducts = await fetchStrapiData('challenge-products');

  console.log('Relations procesadas:', relations);
  console.log('All Products procesados:', allproducts);

  if (!relations || !Array.isArray(relations)) {
    throw new Error('No se encontraron relaciones válidas en Strapi');
  }

  // Procesar stepsData
  const stepsData = relations
    .filter(relation => relation && relation.challenge_step)
    .reduce((acc, relation) => {
      const stepName = relation.challenge_step.name;
      if (!acc[stepName]) {
        acc[stepName] = {
          step: stepName,
          relations: [],
          numberOfStages: 0,
        };
      }
      acc[stepName].relations.push({
        id: relation.id,
        challenge_subcategory: relation.challenge_subcategory,
        documentId: relation.documentId,
        products: relation.challenge_products || [],
        stages: relation.challenge_stages || [],
      });
      const allStages = acc[stepName].relations.flatMap(rel => rel.stages);
      acc[stepName].numberOfStages = [...new Set(allStages.map(stage => stage.id))].length;
      return acc;
    }, {});

  const stepsArray = Object.values(stepsData).sort((a, b) => a.numberOfStages - b.numberOfStages);

  const result = {
    steps: stepsArray.map(step => ({
      name: step.step,
      optionsCount: step.relations.length,
      products: step.relations[0].products.map(p => ({
        name: p.name,
        balance: p.name,
        woocommerceId: p.WoocomerceId,
      })),
    })),
    details: {},
  };

  // Obtener precios y stages para cada combinación
  for (const step of stepsArray) {
    result.details[step.step] = {};
    for (const product of step.relations[0].products) {
      const endpoint = product.WoocomerceId ? `products/${product.WoocomerceId}/variations?per_page=100` : null;
      let price = null;
      let stages = step.relations[0].stages;

      if (endpoint) {
        try {
          const variations = await wooFetcher(endpoint);
          const matchingVariation = variations.find(variation =>
            variation.attributes.some(attr => attr.name === "step" && attr.option.toLowerCase() === step.step.toLowerCase()) &&
            variation.attributes.some(attr => attr.name === "subcategory" && attr.option.toLowerCase() === step.relations[0].challenge_subcategory.name.toLowerCase())
          );
          price = matchingVariation?.price || "N/A";
        } catch (error) {
          console.error(`Error fetching WooCommerce variations for product ${product.WoocomerceId}:`, error.message);
          price = "N/A";
        }
      }

      result.details[step.step][product.name] = {
        stages: stages.map(stage => ({
          name: stage.name,
          phase: stage.phase,
          minimumTradingDays: stage.minimumTradingDays,
          maximumDailyLoss: stage.maximumDailyLoss,
          profitTarget: stage.profitTarget,
          leverage: stage.leverage,
          maximumTotalLoss: stage.maximumTotalLoss,
          maximumLossPerTrade: stage.maximumLossPerTrade,
        })),
        price,
      };
    }
  }

  return result;
}

// Handler con CORS
const handler = async (req, res) => {
  try {
    const data = await getChallengeData();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en el handler:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default allowCors(handler);