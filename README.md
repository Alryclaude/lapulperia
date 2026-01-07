# La Pulperia - Marketplace Hondureno

Marketplace que digitaliza el comercio local hondureno, conectando pulperias con clientes de su comunidad.

## Tecnologias

### Frontend
- React 18 + Vite
- TailwindCSS
- React Query
- Zustand
- React Router v6
- Leaflet (mapas)
- Framer Motion

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.IO
- Firebase Admin SDK

### Servicios (Gratuitos)
- **Render** - Hosting
- **Cloudinary** - Imagenes
- **Firebase Auth** - Autenticacion
- **Firebase Cloud Messaging** - Notificaciones push
- **OpenStreetMap** - Mapas

## Instalacion Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Inicializar base de datos
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd client
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Iniciar en desarrollo
npm run dev
```

## Deploy en Render

### 1. Preparar el proyecto

1. Sube el proyecto a un repositorio de GitHub
2. Crea una cuenta en [Render](https://render.com)

### 2. Crear servicios

#### Opcion A: Blueprint (Recomendado)

1. En Render, ve a "Blueprints" > "New Blueprint Instance"
2. Conecta tu repositorio de GitHub
3. Render detectara automaticamente el `render.yaml`
4. Configura las variables de entorno marcadas como `sync: false`
5. Deploy!

#### Opcion B: Manual

1. **Base de datos PostgreSQL**
   - Crear nuevo PostgreSQL
   - Plan: Free
   - Copiar la Connection String

2. **Backend (Web Service)**
   - Crear nuevo Web Service
   - Conectar repositorio
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Agregar variables de entorno

3. **Frontend (Static Site)**
   - Crear nuevo Static Site
   - Conectar repositorio
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Agregar variables de entorno

### 3. Variables de Entorno

#### Backend (.env)

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Firebase Admin
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# JWT
JWT_SECRET=tu-secret-seguro

# Frontend URL
CLIENT_URL=https://lapulperiahn.shop
```

#### Frontend (.env)

```env
VITE_API_URL=https://lapulperia-api.onrender.com

# Firebase Client
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Dominio Personalizado

1. En el Static Site de Render, ve a Settings > Custom Domains
2. Agrega `lapulperiahn.shop`
3. En tu registrador de dominio, configura los DNS:
   - CNAME: `@` -> `lapulperia-client.onrender.com`
   - CNAME: `www` -> `lapulperia-client.onrender.com`

## Configurar Servicios Externos

### Cloudinary

1. Crea cuenta en [cloudinary.com](https://cloudinary.com)
2. Ve a Dashboard > Settings
3. Copia Cloud Name, API Key y API Secret
4. Configura los upload presets necesarios

### Firebase

1. Crea proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Authentication > Sign-in method > Google
3. Ve a Project Settings > Service accounts > Generate new private key
4. Para notificaciones push:
   - Ve a Cloud Messaging
   - Genera la clave VAPID
   - Configura el service worker

## Estructura del Proyecto

```
LAPULPE/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Paginas/Vistas
│   │   ├── stores/         # Estado global (Zustand)
│   │   ├── services/       # API calls
│   │   └── styles/         # CSS global
│   └── public/             # Assets estaticos
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Endpoints API
│   │   ├── controllers/    # Logica de negocio
│   │   ├── middleware/     # Auth, validacion
│   │   └── services/       # Cloudinary, Firebase
│   └── prisma/             # Schema y migraciones
│
├── render.yaml             # Config de deploy
└── README.md
```

## Funcionalidades Principales

### Para Pulperias
- Registro y gestion de productos
- Panel de ordenes en tiempo real (gamificado)
- Dashboard de estadisticas
- Publicacion de empleos
- Modo vacaciones
- Exportacion de datos

### Para Clientes
- Busqueda de productos y pulperias
- Carrito multi-pulperia
- Historial de pedidos
- Sistema de favoritos
- Reseñas
- Alertas de disponibilidad

### Caracteristicas Honduras
- Referencias de ubicacion locales
- Productos de temporada
- Integracion WhatsApp
- Mapas con OpenStreetMap

## Licencia

MIT License - Este proyecto fue creado para digitalizar el comercio local hondureno.

---

Desarrollado con amor para Honduras
