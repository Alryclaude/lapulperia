/**
 * Reverse geocoding service using OpenStreetMap Nominatim
 * Free, no API key required
 */

/**
 * Convert coordinates to a human-readable address
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{address: string, details: object}>}
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=es`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LaPulperia-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    // Build a clean address string for Honduras
    const addr = data.address || {};

    // Prioritize relevant address components for Honduras
    const parts = [];

    // Street/road info
    if (addr.road || addr.street) {
      parts.push(addr.road || addr.street);
    }

    // Neighborhood/suburb
    if (addr.neighbourhood || addr.suburb || addr.residential) {
      parts.push(addr.neighbourhood || addr.suburb || addr.residential);
    }

    // City/town
    if (addr.city || addr.town || addr.village || addr.municipality) {
      parts.push(addr.city || addr.town || addr.village || addr.municipality);
    }

    // Department (state equivalent in Honduras)
    if (addr.state || addr.county) {
      parts.push(addr.state || addr.county);
    }

    // If we couldn't parse components, use the display name
    const address = parts.length > 0
      ? parts.join(', ')
      : data.display_name?.split(',').slice(0, 4).join(',').trim();

    return {
      address: address || 'Direccion no encontrada',
      details: {
        road: addr.road || addr.street,
        neighbourhood: addr.neighbourhood || addr.suburb,
        city: addr.city || addr.town || addr.village,
        state: addr.state,
        country: addr.country,
        fullAddress: data.display_name,
      },
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      address: '',
      details: null,
      error: error.message,
    };
  }
};

export default { reverseGeocode };
