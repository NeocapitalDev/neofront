// lib/strapiService.js

export async function getStrapiData(endpoint) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch data from Strapi');
      }
  
      const data = await res.json();
  
      // Acceder a la propiedad 'data' para obtener los resultados
      if (data.data && Array.isArray(data.data)) {
        return data.data;  // Retorna solo el array de 'data'
      } else {
        return [];  // Si no se encuentra un array, devuelve un array vacío
      }
    } catch (error) {
      console.error('Error en la solicitud a Strapi:', error);
      throw error;
    }
  }
  