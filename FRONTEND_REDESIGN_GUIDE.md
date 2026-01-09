# Guía de Rediseño Frontend - La Pulperia

> Este documento es la "biblia" para el agente de rediseño frontend. Contiene todo lo necesario para entender, navegar y rediseñar el frontend de La Pulperia.

---

## 1. Resumen del Proyecto

**La Pulperia** es un marketplace que conecta pulperías (tiendas de barrio hondureñas) con clientes locales.

### Roles de Usuario
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| CLIENT | Clientes que compran | Buscar, ordenar, favoritos, reseñas |
| PULPERIA | Dueños de pulpería | Dashboard, gestión de productos/órdenes/empleos |

### Tech Stack Frontend
- **React 18** + Vite
- **TailwindCSS** (mobile-first)
- **React Query** (TanStack Query) para server state
- **Zustand** para client state (auth, cart)
- **React Router v6** para routing
- **Socket.IO** para notificaciones real-time
- **Leaflet** para mapas
- **Chart.js** para gráficos del dashboard

---

## 2. Arquitectura de Carpetas

```
client/src/
├── api/                    # ✅ NUEVO - APIs separadas por dominio
│   ├── client.js           # Instancia axios + interceptors
│   ├── auth.js             # userApi
│   ├── pulperia.js         # pulperiaApi
│   ├── products.js         # productApi
│   ├── orders.js           # orderApi
│   ├── jobs.js             # jobApi
│   ├── reviews.js          # reviewApi
│   ├── services.js         # serviceApi
│   ├── stats.js            # statsApi
│   └── index.js            # Re-exports todo
│
├── features/               # ✅ NUEVO - Organizado por feature
│   ├── auth/index.js       # Login, Register, Profile, store
│   ├── products/index.js   # Home, Search, ProductDetail
│   ├── orders/index.js     # Cart, Orders, OrderDetail, store
│   ├── pulperia/index.js   # PulperiaProfile, Dashboard/*, Favorites
│   ├── jobs/index.js       # Jobs, JobDetail, MyApplications
│   ├── services/index.js   # Services, ServiceCatalog
│   ├── reviews/index.js    # MyReviews, ReviewForm
│   └── settings/index.js   # Settings, Notifications, Privacy, Help
│
├── shared/                 # ✅ NUEVO - Componentes compartidos
│   └── components/
│       └── layout/         # Layout, Header, BottomNav, etc.
│
├── components/             # Original - aún funcional
│   ├── layout/             # Layout components
│   ├── auth/               # ProtectedRoute, PulperiaRoute
│   ├── common/             # PulperiaCard
│   ├── map/                # MiniMap
│   ├── products/           # ProductCard
│   └── ReviewForm.jsx
│
├── pages/                  # Original - todas las páginas
│   └── pulperia/           # Dashboard pages para PULPERIA role
│
├── stores/                 # Zustand stores
│   ├── authStore.js        # Auth state + Firebase
│   └── cartStore.js        # Shopping cart
│
├── services/               # Original services (legacy, re-exports to /api)
│   ├── api.js              # Re-exports desde /api/*
│   ├── firebase.js         # Firebase config
│   └── notifications.js    # Push notifications
│
├── App.jsx                 # Router principal
└── main.jsx                # Entry point
```

### Cómo Importar (Nuevo Sistema)
```jsx
// APIs
import { productApi, pulperiaApi } from '@api';

// Features
import { Cart, useCartStore } from '@features/orders';
import { Login, useAuthStore } from '@features/auth';

// Shared
import { Layout, Header } from '@shared';
```

---

## 3. Flujos de Usuario Principales

### 3.1 Flujo de Compra (Cliente)
```
Home → Search/Pulperia → ProductDetail → Add to Cart → Cart → Checkout → Order Tracking
```

**Páginas involucradas:**
1. `Home.jsx` - Lista pulperías cercanas
2. `Search.jsx` - Búsqueda con filtros
3. `PulperiaProfile.jsx` - Perfil de pulpería + productos
4. `ProductDetail.jsx` - Detalle de producto
5. `Cart.jsx` - Carrito de compras
6. `Orders.jsx` - Lista de órdenes
7. `OrderDetail.jsx` - Tracking de orden

### 3.2 Flujo de Favoritos
```
PulperiaProfile → Toggle Favorite → Favorites List
```

### 3.3 Flujo de Gestión (Pulpería)
```
Dashboard → ManageProducts/ManageOrders/ManageJobs → Stats
```

**Páginas involucradas:**
1. `Dashboard.jsx` - Métricas y estadísticas
2. `ManageProducts.jsx` - CRUD de productos
3. `ManageOrders.jsx` - Gestión de pedidos
4. `ManageJobs.jsx` - Gestión de empleos
5. `PulperiaSettings.jsx` - Configuración

### 3.4 Flujo de Empleos
```
Jobs → JobDetail → Apply → MyApplications
```

### 3.5 Flujo de Servicios (Freelancers)
```
Services → ServiceCatalog → Contact
```

---

## 4. API Endpoints Disponibles

### Auth (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /register | Registro con Firebase token |
| POST | /login | Login con Firebase token |
| GET | /me | Obtener perfil actual |
| PATCH | /me | Actualizar perfil |
| GET | /export | Exportar datos del usuario |
| DELETE | /me | Eliminar cuenta |

### Pulperías (`/api/pulperias`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Listar pulperías (filtros: lat, lng, radius, status) |
| GET | /:id | Detalle de pulpería |
| GET | /me | Mi pulpería |
| PATCH | /me | Actualizar mi pulpería |
| PATCH | /me/status | Cambiar estado (OPEN/CLOSED/VACATION) |
| POST | /me/logo | Subir logo |
| POST | /me/banner | Subir banner |
| POST | /:id/favorite | Toggle favorito |
| POST | /me/loyalty | Configurar programa de lealtad |
| POST | /me/close | Cerrar permanentemente |

### Productos (`/api/products`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /search | Buscar productos (filtros: q, category, lat, lng) |
| GET | /pulperia/:id | Productos de una pulpería |
| GET | /my-products | Mis productos (pulpería) |
| GET | /:id | Detalle de producto |
| POST | / | Crear producto (FormData) |
| PATCH | /:id | Actualizar producto |
| PATCH | /:id/stock | Toggle disponibilidad |
| PATCH | /:id/featured | Toggle destacado |
| DELETE | /:id | Eliminar producto |
| POST | /:id/alert | Crear alerta de stock |

### Órdenes (`/api/orders`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /my-orders | Mis pedidos (cliente) |
| GET | /pulperia-orders | Pedidos de mi pulpería |
| GET | /:id | Detalle de orden |
| POST | / | Crear orden |
| POST | /batch | Crear múltiples órdenes |
| PATCH | /:id/status | Actualizar estado |

### Empleos (`/api/jobs`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Listar empleos |
| GET | /my-jobs | Empleos de mi pulpería |
| GET | /my-applications | Mis aplicaciones |
| GET | /:id | Detalle de empleo |
| POST | / | Crear empleo |
| POST | /:id/apply | Aplicar (FormData con CV) |
| PATCH | /applications/:id | Actualizar aplicación |

### Reviews (`/api/reviews`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /pulperia/:id | Reviews de pulpería |
| GET | /my-reviews | Mis reviews |
| POST | / | Crear review |
| PATCH | /:id | Actualizar review |
| DELETE | /:id | Eliminar review |

### Servicios (`/api/services`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Listar catálogos de servicios |
| GET | /my-catalogs | Mis catálogos |
| GET | /user/:userId | Catálogos de un usuario |
| POST | / | Crear catálogo (FormData) |

### Stats (`/api/stats`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /dashboard | Estadísticas del dashboard |
| GET | /insights | Insights detallados |
| GET | /export | Exportar CSV |

---

## 5. Estado Global (Stores)

### authStore (Zustand)
```javascript
{
  user: { id, name, email, role, avatar, pulperia? },
  token: string,
  isAuthenticated: boolean,
  isLoading: boolean,

  // Actions
  initialize(),      // Auto-login desde Firebase
  login(userData),   // Set user + token
  logout(),          // Clear all + redirect
  updateUser(data),  // Partial update
}
```

### cartStore (Zustand)
```javascript
{
  items: [{ product, quantity, pulperiaId }],

  // Actions
  addItem(product, pulperiaId),
  removeItem(productId),
  updateQuantity(productId, quantity),
  clearCart(),
  getTotal(),
  getItemsByPulperia(),
}
```

---

## 6. Convenciones y Patrones

### Naming
- **Componentes**: PascalCase (`ProductCard.jsx`)
- **Hooks**: camelCase con `use` prefix (`useAuthStore`)
- **API functions**: camelCase (`getMyOrders`)
- **CSS classes**: Tailwind utilities

### Componentes
```jsx
// Patrón estándar de página
const PageName = () => {
  // 1. Hooks (useQuery, useMutation, useParams, etc.)
  // 2. State local
  // 3. Handlers
  // 4. Render

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Content */}
      {/* Actions */}
    </div>
  );
};
```

### React Query
```jsx
// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productApi.search(filters),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => productApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
    toast.success('Producto creado');
  },
});
```

---

## 7. Diseño Actual

### Colores (tailwind.config.js)
```javascript
colors: {
  primary: {
    500: '#DC2626',  // Rojo principal
    600: '#B91C1C',
    700: '#991B1B',
  },
  amber: {
    500: '#F59E0B',  // Acento
  },
  gray: {
    50: '#F9FAFB',
    900: '#111827',
  },
}
```

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Componentes UI Existentes
| Componente | Ubicación | Uso |
|------------|-----------|-----|
| Layout | components/layout/ | Wrapper principal |
| Header | components/layout/ | Navbar top |
| BottomNav | components/layout/ | Nav móvil bottom |
| StarField | components/layout/ | Fondo animado |
| ProductCard | components/products/ | Tarjeta de producto |
| PulperiaCard | components/common/ | Tarjeta de pulpería |
| MiniMap | components/map/ | Mapa con Leaflet |
| ReviewForm | components/ | Formulario de reseña |

---

## 8. Prioridades de Rediseño

### Alta Prioridad
1. **Home.jsx** - Primera impresión, mostrar pulperías cercanas
2. **Search.jsx** - Búsqueda de productos, filtros
3. **PulperiaProfile.jsx** - Perfil de tienda, productos, reseñas
4. **Cart.jsx** - Proceso de compra

### Media Prioridad
5. **Dashboard.jsx** - Panel de control para pulperías
6. **ManageProducts.jsx** - CRUD de productos
7. **Orders.jsx** - Lista de pedidos

### Baja Prioridad
8. Settings pages
9. Jobs/Services (features secundarias)

---

## 9. Características Honduras-Específicas

### Direcciones
- Usar campo `reference` en vez de direcciones formales
- Ejemplo: "Frente al palo de mango, 2 casas al norte de la iglesia"
- El mapa es complementario, no principal

### Pagos
- No hay pagos en línea implementados
- El flujo es: orden → pago en persona → confirmación manual

### Horarios
- Las pulperías tienen estados: OPEN, CLOSED, VACATION
- Muchas cierran al mediodía y reabren

### Idioma
- **UI en español**
- **Código en inglés**
- Moneda: Lempiras (L)

---

## 10. Checklist de Rediseño por Feature

### Auth
- [ ] Login responsive y atractivo
- [ ] Register con validación clara
- [ ] Profile con opciones organizadas

### Products
- [ ] Home con hero section y pulperías destacadas
- [ ] Search con filtros intuitivos (categoría, precio, distancia)
- [ ] ProductDetail con galería, descripción, botón comprar
- [ ] ProductCard compacto pero informativo

### Orders
- [ ] Cart con resumen claro, edición fácil
- [ ] Checkout simplificado
- [ ] Order tracking con estados visuales
- [ ] Historial de órdenes filtrable

### Pulperia
- [ ] PulperiaProfile atractivo con banner, logo, info
- [ ] Dashboard con métricas claras (gráficos, KPIs)
- [ ] ManageProducts con grid/list toggle, búsqueda rápida
- [ ] ManageOrders con estados codificados por color

### Jobs
- [ ] Lista de empleos con filtros
- [ ] JobDetail con descripción completa
- [ ] Formulario de aplicación simple

### Settings
- [ ] Diseño unificado para todas las settings
- [ ] Navegación clara entre secciones

---

## 11. Performance Considerations

### Ya Implementado
- React Query caching
- Vite code splitting (vendor, charts, maps chunks)
- Image optimization via Cloudinary

### Por Implementar
- [ ] Lazy loading de páginas (`React.lazy()`)
- [ ] Skeleton loaders durante carga
- [ ] Infinite scroll para listas largas
- [ ] Image lazy loading

---

## 12. Socket.IO Events

### Eventos que el Frontend escucha:
| Evento | Descripción | Dónde usarlo |
|--------|-------------|--------------|
| `new-order` | Nueva orden recibida | Dashboard/ManageOrders |
| `order-updated` | Estado de orden cambió | Orders/OrderDetail |
| `pulperia-status-changed` | Pulpería abrió/cerró | Favorites |
| `product-back-in-stock` | Producto disponible | Notificaciones |
| `new-application` | Nueva aplicación de empleo | ManageJobs |
| `application-updated` | Estado de aplicación | MyApplications |

### Conexión
```javascript
// Ya configurado en services/notifications.js
import { io } from 'socket.io-client';
const socket = io(API_URL);
socket.emit('join', userId);
```

---

## 13. Archivos Clave para Modificar

| Archivo | Qué Contiene | Prioridad |
|---------|--------------|-----------|
| `App.jsx` | Router, rutas | Media |
| `pages/Home.jsx` | Landing page | Alta |
| `pages/Search.jsx` | Búsqueda | Alta |
| `pages/PulperiaProfile.jsx` | Perfil tienda | Alta |
| `pages/Cart.jsx` | Carrito | Alta |
| `components/products/ProductCard.jsx` | Tarjeta producto | Alta |
| `components/common/PulperiaCard.jsx` | Tarjeta pulpería | Alta |
| `tailwind.config.js` | Tema colores | Media |

---

## 14. Comandos Útiles

```bash
# Desarrollo
npm run dev:client      # Solo frontend (port 5173)
npm run dev             # Frontend + Backend

# Build
npm run build

# Verificar estructura
find src -name "*.jsx" | head -20
```

---

## 15. Notas Finales

1. **Mobile-first**: El 80%+ del tráfico es móvil
2. **Simplicidad**: Los usuarios no son tech-savvy
3. **Velocidad**: Conexiones lentas en zonas rurales
4. **Offline-friendly**: Considerar estados de carga/error claros

### Recursos de Inspiración
- Rappi (flujo de compra)
- Uber Eats (UI de restaurantes)
- Mercado Libre (búsqueda/filtros)
- Apps de pulperías locales

---

*Documento generado el 2026-01-08 para facilitar el rediseño del frontend.*
