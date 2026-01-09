# La Pulperia - Documentacion del Proyecto

## Resumen

**La Pulperia** es una aplicacion web progresiva (PWA) que conecta tiendas de barrio (pulperias) con clientes en Honduras. Permite a los duenos de pulperias digitalizar su negocio, gestionar productos, recibir pedidos en tiempo real, y publicar ofertas de empleo.

---

## Estado Actual (Enero 2026)

### Ultimo Despliegue
- **Commit**: `6f6856e` - "feat: Complete visual redesign with dark theme and animated logo"
- **Fecha**: 9 de Enero, 2026
- **Branch**: `main`

### Cambios Recientes

#### Rediseno Visual Completo (v2.0)
Se implemento un rediseno visual completo basado en el concepto "Calido, Acogedor y Moderno":

1. **Nuevo Logo SVG** (`client/src/components/Logo.jsx`)
   - Casa/tiendita ilustrada con techo rojo, paredes crema, ventanas azul marino, puerta marron
   - Estrellas doradas animadas con efecto twinkle (Framer Motion)
   - Exporta: `Logo`, `LogoIcon`, `LogoLarge`, `StarShape`

2. **Tema Oscuro como Principal**
   - Fondo negro con tinte purpura (#0F0D15 -> #1A1625)
   - Campo de estrellas animadas sutiles en el fondo
   - Efectos glassmorphism en header y componentes

3. **Nueva Paleta de Colores** (`client/tailwind.config.js`)
   ```
   Primary:   #DC2626 (rojo - CTAs, botones principales)
   Accent:    #F59E0B / #FFD700 (dorado - estrellas, acentos premium)
   Cream:     #FEF3C7 (crema - acentos calidos)
   Brown:     #92400E (marron - elementos complementarios)
   Navy:      #1E3A5F (azul oscuro - detalles)
   Dark:      #0F0D15 -> #1F1B2E (fondos)
   ```

4. **Componentes Actualizados**
   - `Header.jsx` - Glassmorphism, nuevo logo
   - `BottomNav.jsx` - Iconos con glow al activarse
   - `ProductCard.jsx` - Tema oscuro, badges coloridos
   - `PulperiaCard.jsx` - Tema oscuro, rating dorado
   - `Home.jsx` - Hero con logo animado
   - `Dashboard.jsx` - Stat cards con gradientes

---

## Arquitectura del Proyecto

```
LAPULPE/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── layout/    # Header, BottomNav, Layout
│   │   │   ├── common/    # PulperiaCard, etc.
│   │   │   ├── products/  # ProductCard, etc.
│   │   │   └── Logo.jsx   # Logo SVG animado
│   │   ├── pages/
│   │   │   ├── pulperia/  # Dashboard, Settings, etc.
│   │   │   └── ...        # Home, Login, Search, etc.
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── styles/        # index.css (global styles)
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, upload, etc.
│   │   ├── services/      # Business logic
│   │   └── lib/           # Utils, Prisma client
│   └── prisma/
│       └── schema.prisma  # Database schema
│
└── _agent_docs/           # Documentacion interna
```

---

## Stack Tecnologico

### Frontend
- **React 18** + **Vite** - Framework y bundler
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI base
- **Framer Motion** - Animaciones
- **React Query** - Estado servidor / caching
- **Zustand** - Estado global cliente
- **React Router DOM** - Routing
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

### Backend
- **Node.js** + **Express** - Servidor API
- **Prisma** - ORM
- **PostgreSQL** - Base de datos (Render)
- **Cloudinary** - Almacenamiento de imagenes
- **JWT** - Autenticacion
- **Multer** - Upload de archivos

### Despliegue
- **Frontend**: Render (Static Site)
- **Backend**: Render (Web Service)
- **Database**: Render PostgreSQL
- **Imagenes**: Cloudinary

---

## Variables de Entorno

### Backend (server/.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**NOTA IMPORTANTE**: El codigo del servidor solo soporta las 3 variables separadas de Cloudinary (CLOUD_NAME, API_KEY, API_SECRET). NO usa CLOUDINARY_URL.

### Frontend (client/.env)
```env
VITE_API_URL=https://your-api-url.render.com
```

---

## Problemas Conocidos

### 1. Cloudinary "Invalid Signature" Error
- **Sintoma**: Error al subir imagenes de productos, logo o banner
- **Causa**: Credenciales de Cloudinary mal configuradas en Render
- **Solucion**: Verificar que CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET esten correctamente configurados en las variables de entorno del servidor en Render

### 2. Rutas de API
- Algunas rutas en el frontend llaman a endpoints que no existen en el backend (identificadas en auditorias previas)
- Ver `_agent_docs` para detalles

---

## Sistema de Diseno

### Colores (Tailwind)
```javascript
colors: {
  primary: {
    DEFAULT: '#DC2626',  // Rojo principal
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626',
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#450A0A',
  },
  accent: {
    DEFAULT: '#F59E0B',  // Dorado
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  gold: {
    DEFAULT: '#FFD700',
    light: '#FFE55C',
    dark: '#B8860B',
  },
  dark: {
    DEFAULT: '#0F0D15',  // Fondo principal
    50: '#2A2735',
    100: '#1F1B2E',
    200: '#1A1625',
    300: '#15121D',
    400: '#0F0D15',
  },
}
```

### Sombras
```javascript
boxShadow: {
  'primary': '0 4px 14px 0 rgba(220, 38, 38, 0.25)',
  'gold': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
  'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
  'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
}
```

### Animaciones
- **Twinkle**: Parpadeo sutil de estrellas
- **cardHover**: Scale sutil en hover para cards
- **fadeIn**: Entrada con opacidad y movimiento Y

---

## Comandos Utiles

```bash
# Desarrollo frontend
cd client && npm run dev

# Build frontend
cd client && npm run build

# Desarrollo backend
cd server && npm run dev

# Prisma
cd server && npx prisma studio      # Ver DB
cd server && npx prisma migrate dev # Migraciones
cd server && npx prisma generate    # Generar cliente
```

---

## Funcionalidades Principales

### Para Clientes
- Buscar pulperias cercanas (geolocalizacion)
- Ver productos y precios
- Agregar al carrito y ordenar
- Guardar pulperias favoritas
- Dejar resenas
- Buscar empleos

### Para Duenos de Pulperia
- Dashboard con estadisticas de ventas
- Gestion de productos (CRUD)
- Gestion de ordenes en tiempo real
- Publicar ofertas de empleo
- Configurar perfil de negocio
- Exportar datos (CSV/JSON)
- Toggle abrir/cerrar negocio

---

## Historial de Versiones

### v2.0 (Enero 2026)
- Rediseno visual completo con tema oscuro
- Nuevo logo SVG animado
- Campo de estrellas en fondo
- Efectos glassmorphism
- Paleta de colores calida (rojo, dorado, crema)

### v1.x (Anteriores)
- Implementacion inicial
- Sistema de autenticacion
- CRUD de productos y ordenes
- Sistema de favoritos
- Busqueda y geolocalizacion
- Integracion con Cloudinary

---

## Contacto y Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio de GitHub.
