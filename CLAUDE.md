# CLAUDE.md - La Pulperia

> Guía completa para cualquier agente trabajando en este proyecto.
> Última actualización: 2026-01-08

---

## Resumen del Proyecto

**La Pulperia** es un marketplace que conecta pulperías (tiendas de barrio hondureñas) con clientes locales. Permite a los clientes descubrir tiendas cercanas, ordenar productos, y a los dueños gestionar su negocio digitalmente.

### Roles de Usuario
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `CLIENT` | Clientes compradores | Buscar, ordenar, favoritos, reseñas, aplicar a empleos |
| `PULPERIA` | Dueños de pulpería | Dashboard, gestión de productos/órdenes/empleos, estadísticas |

### Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, React Query, Zustand, Socket.IO
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Auth**: Firebase Authentication
- **Storage**: Cloudinary (imágenes)
- **Deploy**: Render.com (auto-deploy desde main)

---

## Estado Actual del Proyecto (2026-01-08)

### ✅ Completado Recientemente

#### Auditoría y Bug Fixes
- [x] API methods `exportData()` y `deleteAccount()` agregados
- [x] Endpoint `GET /api/auth/export` para exportar datos de usuario
- [x] Bug de stale closure en toggle favorito arreglado
- [x] Orden de rutas en services.js corregido (`/user/:userId` antes de `/:id`)
- [x] Vulnerabilidad CSV injection arreglada con `escapeCSV()`
- [x] N+1 queries optimizados (frequent customers, daily revenue)
- [x] Distance filtering corregido (limit después de filtro)
- [x] 3 índices de BD agregados (OrderItem, Review, LoyaltyPoint)
- [x] HTTP status codes corregidos (409 para duplicados, 410 para cerrado)
- [x] Socket.IO optimizado (broadcast → targeted emit)

#### Nuevas Páginas
- [x] `/reviews` - MyReviews.jsx
- [x] `/applications` - MyApplications.jsx
- [x] `/settings/notifications` - NotificationSettings.jsx
- [x] `/settings/privacy` - PrivacySettings.jsx
- [x] `/help` - Help.jsx
- [x] Redirect `/profile/services` → `/my-services`

#### Features Implementados
- [x] Product Alert Notifications (Socket.IO cuando producto vuelve a stock)
- [x] Streak Achievement (7 días consecutivos de entregas)
- [x] Validación de inputs (price > 0, quantity > 0)

#### Reorganización de Código
- [x] APIs separadas por dominio en `/api/`
- [x] Feature modules con index.js en `/features/`
- [x] Path aliases configurados (@api, @features, @shared)
- [x] FRONTEND_REDESIGN_GUIDE.md creado (512 líneas)

### ⏳ Pendiente

#### Base de Datos
- [ ] Eliminar modelo `Event` no usado (requiere migración)
- [ ] Considerar más índices según patrones de uso

#### Frontend (Próximo Sprint)
- [ ] Rediseño completo del UI (ver FRONTEND_REDESIGN_GUIDE.md)
- [ ] Lazy loading de páginas con React.lazy()
- [ ] Skeleton loaders durante carga
- [ ] Infinite scroll para listas largas

#### Backend
- [ ] Rate limiting para endpoints públicos
- [ ] Logging estructurado
- [ ] Tests automatizados

---

## Comandos

```bash
# Desarrollo
npm run dev              # Frontend + Backend simultáneo
npm run dev:client       # Solo frontend (port 5173)
npm run dev:server       # Solo backend (port 3001)

# Base de datos
npm run db:push          # Push schema changes (dev)
npm run db:migrate       # Run migrations (prod)
npm run db:studio        # Prisma Studio GUI

# Build y Deploy
npm run build            # Build ambos
npm run install:all      # Instalar todas las dependencias
```

---

## Arquitectura

### Estructura de Carpetas (Nueva)

```
client/src/
├── api/                    # ✅ APIs por dominio
│   ├── client.js           # Axios instance + interceptors
│   ├── auth.js             # userApi
│   ├── pulperia.js         # pulperiaApi
│   ├── products.js         # productApi
│   ├── orders.js           # orderApi
│   ├── jobs.js             # jobApi
│   ├── reviews.js          # reviewApi
│   ├── services.js         # serviceApi
│   ├── stats.js            # statsApi
│   └── index.js            # Re-exports
│
├── features/               # ✅ Módulos por feature
│   ├── auth/index.js       # Login, Register, Profile, authStore
│   ├── products/index.js   # Home, Search, ProductDetail
│   ├── orders/index.js     # Cart, Orders, cartStore
│   ├── pulperia/index.js   # PulperiaProfile, Dashboard/*
│   ├── jobs/index.js       # Jobs, Applications
│   ├── services/index.js   # Services, ServiceCatalog
│   ├── reviews/index.js    # MyReviews, ReviewForm
│   └── settings/index.js   # Settings pages
│
├── shared/                 # ✅ Componentes compartidos
│   └── components/layout/  # Layout, Header, BottomNav
│
├── components/             # Original (funcional, legacy)
├── pages/                  # Todas las páginas
├── stores/                 # Zustand stores
└── services/               # Firebase, notifications (legacy api.js)

server/src/
├── routes/                 # Endpoints API
│   ├── auth.js             # /api/auth/*
│   ├── pulperia.js         # /api/pulperias/*
│   ├── products.js         # /api/products/*
│   ├── orders.js           # /api/orders/*
│   ├── jobs.js             # /api/jobs/*
│   ├── reviews.js          # /api/reviews/*
│   ├── services.js         # /api/services/*
│   └── stats.js            # /api/stats/*
├── middleware/
│   └── auth.js             # authenticate, optionalAuth, requirePulperia
└── services/
    ├── prisma.js           # Prisma client
    ├── firebase.js         # Firebase Admin SDK
    └── cloudinary.js       # Upload handlers
```

### Cómo Importar (Nuevo Sistema)

```javascript
// APIs
import { productApi, pulperiaApi } from '@api';
// o
import { productApi } from '../api/products';

// Features (para imports agrupados)
import { Cart, useCartStore } from '@features/orders';

// Shared
import { Layout } from '@shared';

// Legacy (aún funciona)
import { productApi } from '../services/api';
```

### Flujo de Datos

```
Firebase Auth → JWT Token → Express Middleware → Prisma → PostgreSQL
     ↓
React Query (cache) ← API Response
     ↓
Zustand (auth/cart state)
     ↓
Socket.IO (real-time updates)
```

---

## Modelos de Base de Datos

### Principales
- `User` - Usuarios (CLIENT o PULPERIA)
- `Pulperia` - Tiendas
- `Product` - Productos de pulpería
- `Order` → `OrderItem` - Pedidos
- `Review` - Reseñas de clientes
- `Favorite` - Pulperías favoritas (con notifyOnOpen)

### Secundarios
- `Job` → `JobApplication` - Empleos y aplicaciones
- `ServiceCatalog` - Catálogos de freelancers
- `Achievement` - Logros de pulpería
- `LoyaltyProgram` → `LoyaltyPoint` - Programa de lealtad
- `ProductAlert` - Alertas de "avísame cuando llegue"
- `DailyStat` - Estadísticas diarias

### Índices Importantes
```prisma
OrderItem  @@index([productId])
Review     @@index([userId])
LoyaltyPoint @@index([userId])
```

---

## API Endpoints Principales

| Ruta | Descripción |
|------|-------------|
| `POST /api/auth/register` | Registro con Firebase token |
| `GET /api/auth/me` | Perfil del usuario actual |
| `GET /api/auth/export` | Exportar todos los datos del usuario |
| `GET /api/pulperias` | Listar pulperías (filtros: lat, lng, radius) |
| `GET /api/products/search` | Buscar productos |
| `POST /api/orders` | Crear orden |
| `PATCH /api/orders/:id/status` | Actualizar estado de orden |
| `GET /api/stats/dashboard` | Estadísticas del dashboard |

> Ver `FRONTEND_REDESIGN_GUIDE.md` para documentación completa de APIs.

---

## Socket.IO Events

| Evento | Emisor | Receptor | Descripción |
|--------|--------|----------|-------------|
| `new-order` | Server | Pulpería | Nueva orden recibida |
| `order-updated` | Server | Cliente | Estado de orden cambió |
| `pulperia-status-changed` | Server | Favoritos | Pulpería abrió/cerró |
| `product-back-in-stock` | Server | Alertas | Producto disponible |
| `new-application` | Server | Pulpería | Nueva aplicación de empleo |

---

## Convenciones

### Código
- **Idioma UI**: Español
- **Idioma código**: Inglés
- **Componentes**: PascalCase (`ProductCard.jsx`)
- **Hooks**: camelCase con `use` (`useAuthStore`)
- **APIs**: camelCase (`getMyOrders`)

### Diseño
- **Mobile-first**: 80%+ del tráfico es móvil
- **Colores**: Rojo primario (#DC2626), Ámbar acento (#F59E0B)
- **Moneda**: Lempiras (L)
- **Direcciones**: Usar referencias ("Frente al palo de mango")

### Git
- Commits en inglés
- Prefijos: `fix:`, `feat:`, `refactor:`, `docs:`
- Co-author: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

---

## Variables de Entorno

### Client (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Server (.env)
```
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
```

---

## Próximos Pasos Sugeridos

### Prioridad Alta
1. **Rediseño UI** - El frontend necesita un refresh visual completo
   - Usar `FRONTEND_REDESIGN_GUIDE.md` como referencia
   - Priorizar: Home, Search, PulperiaProfile, Cart

2. **Testing** - No hay tests automatizados
   - Agregar Jest + React Testing Library
   - Tests de integración para flujos críticos

### Prioridad Media
3. **Performance**
   - Implementar lazy loading en App.jsx
   - Agregar skeleton loaders
   - Optimizar bundle size

4. **PWA**
   - Service worker para offline
   - Push notifications nativas

### Prioridad Baja
5. **Features nuevos**
   - Chat entre cliente y pulpería
   - Seguimiento de delivery en mapa
   - Cupones y descuentos
   - Múltiples métodos de pago

---

## Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `FRONTEND_REDESIGN_GUIDE.md` | Guía completa para rediseño (512 líneas) |
| `IMPLEMENTATION_PLAN.md` | Plan de la auditoría completada |
| `render.yaml` | Configuración de deploy en Render |
| `client/vite.config.js` | Config de Vite con aliases |
| `server/prisma/schema.prisma` | Modelos de base de datos |

---

## Troubleshooting

### "Cannot find module '@api'"
Los aliases requieren que Vite esté corriendo. Para imports en archivos de config, usar rutas relativas.

### "Firebase token expired"
El interceptor de axios renueva automáticamente. Si persiste, verificar que Firebase esté inicializado.

### "CORS error"
Verificar que `CLIENT_URL` en server/.env coincida con el origen del frontend.

### Base de datos no conecta
1. Verificar `DATABASE_URL` en server/.env
2. Para desarrollo local, necesitas PostgreSQL corriendo
3. En producción, Render maneja la conexión

---

## Notas para el Siguiente Agente

1. **El código está recién reorganizado** - Los imports legacy (`services/api.js`) aún funcionan por backwards compatibility. Los nuevos imports usan `@api`, `@features`, `@shared`.

2. **El rediseño es la prioridad** - El backend está estable. El frontend necesita un refresh completo de UI/UX. Usa `FRONTEND_REDESIGN_GUIDE.md`.

3. **Mobile-first siempre** - Honduras tiene conexiones lentas y usuarios en móviles viejos. Optimiza para esto.

4. **No hay tests** - Si agregas features complejos, considera agregar tests.

5. **Socket.IO está configurado** - Solo necesitas escuchar eventos en el frontend para notificaciones real-time.

---

*Este archivo se actualiza con cada sesión de desarrollo significativa.*
