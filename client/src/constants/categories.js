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
  { id: 'COMER', label: 'Comida', emoji: '🍽️', description: 'Restaurantes, baleadas, comida rápida' },
  { id: 'COMPRAR', label: 'Tiendas', emoji: '🛒', description: 'Abarrotes, mercados, tiendas' },
  { id: 'SERVICIOS', label: 'Servicios', emoji: '🔧', description: 'Talleres, recargas, reparaciones' },
  { id: 'SALUD', label: 'Salud', emoji: '💊', description: 'Farmacias, clínicas, laboratorios' },
  { id: 'BELLEZA', label: 'Belleza', emoji: '💅', description: 'Salones, barberías, spa' },
  { id: 'EDUCACION', label: 'Educación', emoji: '📚', description: 'Tutorías, academias, cursos' },
  { id: 'HOGAR', label: 'Hogar', emoji: '🏠', description: 'Muebles, decoración, ferretería' },
  { id: 'TECNOLOGIA', label: 'Tecnología', emoji: '📱', description: 'Celulares, computadoras, electrónica' },
];

// Categorías para pills del mapa (incluye filtros adicionales)
export const MAP_CATEGORY_PILLS = [
  { id: 'all', label: 'Todos', emoji: '✨', color: 'from-gray-500/30 to-gray-600/20 border-gray-500/40 text-gray-300' },
  { id: 'COMER', label: 'Comida', emoji: '🍽️', color: 'from-amber-500/30 to-amber-600/20 border-amber-500/40 text-amber-300' },
  { id: 'COMPRAR', label: 'Tiendas', emoji: '🛒', color: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/40 text-cyan-300' },
  { id: 'SERVICIOS', label: 'Servicios', emoji: '🔧', color: 'from-blue-500/30 to-blue-600/20 border-blue-500/40 text-blue-300' },
  { id: 'SALUD', label: 'Salud', emoji: '💊', color: 'from-green-500/30 to-green-600/20 border-green-500/40 text-green-300' },
  { id: 'BELLEZA', label: 'Belleza', emoji: '💅', color: 'from-fuchsia-500/30 to-fuchsia-600/20 border-fuchsia-500/40 text-fuchsia-300' },
  { id: 'EDUCACION', label: 'Educación', emoji: '📚', color: 'from-indigo-500/30 to-indigo-600/20 border-indigo-500/40 text-indigo-300' },
  { id: 'HOGAR', label: 'Hogar', emoji: '🏠', color: 'from-orange-500/30 to-orange-600/20 border-orange-500/40 text-orange-300' },
  { id: 'TECNOLOGIA', label: 'Tecnología', emoji: '📱', color: 'from-violet-500/30 to-violet-600/20 border-violet-500/40 text-violet-300' },
  { id: 'oferta', label: 'Ofertas', emoji: '🔥', color: 'from-pink-500/30 to-pink-600/20 border-pink-500/40 text-pink-300' },
];

// Alias para mantener compatibilidad con código existente
export const CATEGORIES = PRODUCT_CATEGORIES;
