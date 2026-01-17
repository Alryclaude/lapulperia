/**
 * Categorías centralizadas para La Pulpería
 * Importar desde aquí para evitar duplicación
 */

// Categorías de productos (inventario)
export const PRODUCT_CATEGORIES = [
  'Bebidas',
  'Lacteos',
  'Carnes',
  'Panaderia',
  'Abarrotes',
  'Snacks',
  'Frutas y Verduras',
  'Limpieza',
  'Cuidado Personal',
  'Otros',
];

// Categorías de tipo de negocio (enum PulperiaCategory en BD)
export const BUSINESS_CATEGORIES = [
  { id: 'COMER', label: 'Comer', emoji: '🍽️', description: 'Restaurantes, comida, baleadas' },
  { id: 'COMPRAR', label: 'Comprar', emoji: '🛒', description: 'Abarrotes, mercados, tiendas' },
  { id: 'SERVICIOS', label: 'Servicios', emoji: '🔧', description: 'Talleres, recargas, pagos' },
];

// Categorías para pills del mapa (incluye filtros adicionales)
export const MAP_CATEGORY_PILLS = [
  { id: 'all', label: 'Todos', emoji: '✨', color: 'from-gray-500/30 to-gray-600/20 border-gray-500/40 text-gray-300' },
  { id: 'COMER', label: 'Comer', emoji: '🍽️', color: 'from-amber-500/30 to-amber-600/20 border-amber-500/40 text-amber-300' },
  { id: 'COMPRAR', label: 'Comprar', emoji: '🛒', color: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/40 text-cyan-300' },
  { id: 'SERVICIOS', label: 'Servicios', emoji: '🔧', color: 'from-blue-500/30 to-blue-600/20 border-blue-500/40 text-blue-300' },
  { id: 'oferta', label: 'Ofertas', emoji: '🔥', color: 'from-pink-500/30 to-pink-600/20 border-pink-500/40 text-pink-300' },
];

// Alias para mantener compatibilidad con código existente
export const CATEGORIES = PRODUCT_CATEGORIES;
