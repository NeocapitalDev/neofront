// pages/api/challenge-price.js
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

// Obtener precio para un step y woocommerceId específico directamente de WooCommerce
async function getChallengePrice(step, woocommerceId) {
  try {
    // Crear instancia de API de WooCommerce
    const url = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WP_URL;
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    const api = createWooCommerceApi(url, consumerKey, consumerSecret);

    // Obtener todas las variaciones del producto
    const endpoint = `products/${woocommerceId}/variations?per_page=100`;
    const response = await api.get(endpoint);
    const variations = response.data;

    // Buscar la variación que coincide con el step
    const matchingVariation = variations.find(variation =>
      variation.attributes.some(attr => 
        attr.name === "step" && 
        attr.option.toLowerCase() === step.toLowerCase()
      )
    );

    if (!matchingVariation) {
      throw new Error(`No se encontró una variación para step: ${step} y woocommerceId: ${woocommerceId}`);
    }

    // Devolver el precio y detalles relevantes
    return {
      price: matchingVariation.price || "N/A",
    };
    
  } catch (error) {
    console.error('Error obteniendo precio:', error.message);
    throw error;
  }
}

// Handler con CORS
const handler = async (req, res) => {
  // Soportar tanto GET como POST
  const { step, woocommerceId } = req.method === 'POST' ? req.body : req.query;
  
  if (!step || !woocommerceId) {
    return res.status(400).json({ 
      error: 'Se requieren los parámetros "step" y "woocommerceId"' 
    });
  }

  try {
    const priceData = await getChallengePrice(step, woocommerceId);
    res.status(200).json(priceData);
  } catch (error) {
    console.error('Error en el handler:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default allowCors(handler);