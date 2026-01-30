<div align="center">

# 🏪 La Pulpería

### Democratizando el comercio de barrio en Honduras

[![Deploy Status](https://img.shields.io/badge/deploy-live-success?style=flat-square&logo=render)](https://lapulperiastore.net)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

<br />

<img src="https://raw.githubusercontent.com/Alryclaude/lapulperia/main/docs/banner.png" alt="La Pulpería Banner" width="100%" />

<br />

**[🌐 Ver Demo](https://lapulperiastore.net)** · **[📖 Documentación](#-documentación)** · **[🐛 Reportar Bug](https://github.com/Alryclaude/lapulperia/issues)**

</div>

---

## ✨ ¿Qué es La Pulpería?

**La Pulpería** es un marketplace que digitaliza el comercio local hondureño, conectando las tiendas de barrio (pulperías) con clientes de su comunidad.

> 🇭🇳 Creado con amor para Honduras — porque el comercio de barrio merece tecnología de primera.

### 🎯 Problema que Resolvemos

Las pulperías son el corazón del comercio hondureño, pero:
- No tienen presencia digital
- Compiten con supermercados sin herramientas
- Los clientes no saben qué pulperías tienen cerca

### 💡 Nuestra Solución

- **Para Clientes**: Encuentra pulperías cercanas, ve sus productos, haz pedidos
- **Para Pulperías**: Panel de gestión gratuito, recibe pedidos, publica ofertas

---

## 🚀 Características

<table>
<tr>
<td width="50%">

### 👤 Para Clientes
- 🗺️ Mapa de pulperías cercanas
- 🛒 Carrito multi-tienda
- ⭐ Sistema de favoritos y reseñas
- 🔔 Alertas de disponibilidad
- 📦 Historial de pedidos

</td>
<td width="50%">

### 🏪 Para Pulperías
- 📊 Dashboard de estadísticas
- 📱 Gestión de productos con fotos
- 🎮 Panel de órdenes gamificado
- 💼 Publicación de empleos (Chambas)
- 🏖️ Modo vacaciones

</td>
</tr>
</table>

### 🇭🇳 Hecho para Honduras

- 📍 Referencias de ubicación locales ("frente a la pulpería de Don Juan")
- 🌽 Productos de temporada
- 💬 Integración WhatsApp
- 🗺️ Mapas OpenStreetMap (sin costos de Google)

---

## 🛠️ Stack Tecnológico

### Frontend
```
React 18 · Vite · TailwindCSS · Zustand · React Query · Framer Motion
```

### Backend
```
Node.js · Express · Prisma ORM · PostgreSQL · Socket.IO
```

### Servicios (100% Gratuitos)
```
Render (hosting) · Cloudinary (imágenes) · Firebase Auth · OpenStreetMap
```

---

## 📦 Instalación

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### Clonar e Instalar

```bash
# Clonar repositorio
git clone https://github.com/Alryclaude/lapulperia.git
cd lapulperia

# Instalar dependencias (raíz, client, server)
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Configurar Variables de Entorno

```bash
# Backend
cp server/.env.example server/.env
# Editar server/.env con tus credenciales

# Frontend
cp client/.env.example client/.env
# Editar client/.env con tus credenciales de Firebase
```

### Iniciar Base de Datos

```bash
cd server
npx prisma migrate dev
```

### Ejecutar en Desarrollo

```bash
# Desde la raíz (ejecuta client y server concurrentemente)
npm run dev

# O por separado:
cd server && npm run dev  # Backend en :3001
cd client && npm run dev  # Frontend en :5173
```

---

## 🌐 Deploy

### Render (Recomendado)

1. Fork este repositorio
2. Crea cuenta en [Render](https://render.com)
3. New → Blueprint → Conectar repo
4. Render detecta `render.yaml` automáticamente
5. Configura variables de entorno
6. ¡Deploy!

### Variables de Entorno Requeridas

<details>
<summary><strong>Backend (.env)</strong></summary>

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secret-seguro
CLIENT_URL=https://tu-dominio.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

</details>

<details>
<summary><strong>Frontend (.env)</strong></summary>

```env
VITE_API_URL=https://tu-api.onrender.com

# Firebase Client
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

</details>

---

## 📁 Estructura del Proyecto

```
lapulperia/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales
│   │   ├── stores/         # Estado global (Zustand)
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   └── styles/         # CSS global
│   └── public/             # Assets estáticos
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Endpoints API
│   │   ├── middleware/     # Auth, validación
│   │   └── services/       # Cloudinary, Firebase
│   └── prisma/             # Schema y migraciones
│
├── docs/                   # Documentación adicional
├── render.yaml             # Config de deploy
└── package.json            # Scripts raíz
```

---

## 🎨 Design System

La Pulpería usa la paleta **"Constelación de Barrio"**:

| Color | Hex | Uso |
|-------|-----|-----|
| 🔴 Primary | `#FA5252` | Acciones principales, CTAs |
| 🟡 Accent | `#FBBF24` | Highlights, badges |
| ⬛ Surface | `#0F0F14` | Fondo principal |
| 🟢 Success | `#22C55E` | Estados positivos, "Abierto" |
| 🔵 Info | `#3B82F6` | Links, información |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/MiFeature`)
3. Commit tus cambios (`git commit -m 'Add: Mi nueva feature'`)
4. Push a la rama (`git push origin feature/MiFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

<div align="center">

### 🇭🇳 Hecho con ❤️ para Honduras

**[La Pulpería](https://lapulperiastore.net)** — Democratizando el comercio de barrio

<sub>¿Preguntas? Abre un [issue](https://github.com/Alryclaude/lapulperia/issues) o contáctanos.</sub>

</div>
