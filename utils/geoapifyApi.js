// utils/geoapifyApi.js
import axios from 'axios';

const GEOAPIFY_API_KEY = '8026316fecc34fc880ebf57ea83c0e15';

export const getGeoapifySuggestions = async (query) => {
  try {
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`
    );
    
    return response.data.features.map((feature) => ({
      formatted: feature.properties.formatted,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error('Error en getGeoapifySuggestions:', error);
    return [];
  }
};

export const getRoute = async (origin, destination) => {
  const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      // Revisamos todas las coordenadas dentro de 'coordinates' 
      const coordinates = data.features[0].geometry.coordinates;

      // Mapeamos todas las coordenadas en todos los niveles
      const route = coordinates.flat().map(coord => ({
        latitude: coord[1],    // La latitud es el segundo elemento
        longitude: coord[0]    // La longitud es el primer elemento
      }));

      console.log('Ruta obtenida:', route);
      return route;
    } else {
      throw new Error('No se encontró una ruta');
    }
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    throw error;
  }
};
