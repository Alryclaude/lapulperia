/**
 * Geo utilities for La Pulperia
 * Centralized distance calculations - DO NOT duplicate in route files
 */

const EARTH_RADIUS_M = 6371e3;  // Earth's radius in meters
const EARTH_RADIUS_KM = 6371;   // Earth's radius in kilometers

/**
 * Converts degrees to radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en metros
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * Calcula la distancia en kilómetros (para usar en búsquedas con radio en km)
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  return getDistance(lat1, lon1, lat2, lon2) / 1000;
}

/**
 * Filtra y ordena items por distancia
 * @param {Array} items - Array de items con coordenadas
 * @param {Object} options - { lat, lng, radius (en km), getCoords: (item) => { lat, lng } }
 * @returns {Array} Items filtrados y ordenados por distancia
 */
export function filterByDistance(items, { lat, lng, radius, getCoords }) {
  if (!lat || !lng) return items;

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const maxRadius = parseFloat(radius) || 10; // Default 10km

  return items
    .map((item) => {
      const coords = getCoords(item);
      if (!coords?.lat || !coords?.lng) {
        return { ...item, distance: null };
      }
      const distance = getDistanceKm(userLat, userLng, coords.lat, coords.lng);
      return { ...item, distance };
    })
    .filter((item) => item.distance === null || item.distance <= maxRadius)
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

/**
 * Calcula bounding box para optimizar queries de DB
 * @param {number} lat - Latitud central
 * @param {number} lng - Longitud central
 * @param {number} radiusKm - Radio en kilómetros
 * @returns {{ minLat, maxLat, minLng, maxLng }}
 */
export function getBoundingBox(lat, lng, radiusKm) {
  const latDelta = radiusKm / 111; // ~111km per degree of latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
