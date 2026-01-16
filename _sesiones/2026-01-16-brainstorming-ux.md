# Sesión de Brainstorming UX/UI - La Pulpería
**Fecha:** 2026-01-16
**Participantes:** Claude (Arquitecto), Gemini (Oráculo), Capitán Alejandro

---

## Estado Inicial Verificado

### Features que EXISTEN pero NO FUNCIONAN o NO ESTÁN CONECTADAS:

| Feature | Archivo | Problema |
|---------|---------|----------|
| Pasaporte Digital | `pages/Passport.jsx` | Sin navegación visible - usuario no puede acceder |
| Notificaciones sonoras | `services/notifications.js` | Carpeta `/public/sounds/` no existe |
| Firebase Push | `services/firebase.js` | VAPID_KEY no configurada |
| Socket.IO | `ManageOrders.jsx:52` | Crea conexión duplicada vs singleton |
| Sellos coleccionables | `api/stamps.js` | API existe pero no se usa en UI |

### Features que SÍ FUNCIONAN:

- Mapa con zoom semántico (estrellas → avatares orbitales)
- Dashboard pulpería (4 tabs: Resumen, Inventario, Promociones, Horarios)
- Carrito agrupado por pulpería
- Gestión de productos con filtros de stock
- Sistema de órdenes con estados (PENDING → ACCEPTED → READY → DELIVERED)

### Áreas a Reimaginar:

1. **Experiencia de gestión de negocios** (Dashboard del pulpero)
2. **Experiencia de compra** (flujo del cliente)

---

## Prompt Enviado a Gemini

```
Oráculo, necesito una sesión de brainstorming para mejorar La Pulpería - un marketplace de pulperías hondureñas.

CONTEXTO VERIFICADO DEL PROYECTO:
- Stack: React 18 + Vite, Express + Prisma + PostgreSQL
- Tema visual: Dark theme con acentos rojos/dorados
- 79+ componentes React existentes

FEATURES QUE EXISTEN PERO NO FUNCIONAN O NO ESTÁN CONECTADAS:
1. Pasaporte Digital (/passport) - La página existe pero NO hay navegación visible
2. Notificaciones - Socket.IO implementado pero sin sonidos, Firebase FCM sin VAPID key
3. Sistema de sellos coleccionables - API existe pero nunca se llama desde el frontend

FEATURES QUE SÍ FUNCIONAN:
- Mapa con zoom semántico (estrellas a distancia, avatares de cerca)
- Dashboard de pulpería con 4 tabs
- Carrito agrupado por pulpería
- Gestión de productos con filtros de stock
- Sistema de órdenes con estados

ÁREAS A REIMAGINAR:
1. Experiencia de manejo de negocios (Dashboard del pulpero)
2. Experiencia de compra del cliente

SOLICITUD:
Ideas creativas pero REALISTAS para:
1. Cómo integrar el pasaporte digital de forma visible y atractiva
2. Mejoras UX/UI para el dashboard del pulpero
3. Mejoras al flujo de compra
4. Referencias visuales o patrones de diseño a seguir
```

---

## Respuesta de Gemini

### 1. Pasaporte Digital: De "Invisible" a "Centro de la Experiencia"

**Metáfora:** "Pasaporte de Viajero Urbano" - no solo lealtad, es tu credencial del barrio.

**Integración UI propuesta:**
- **Avatar con Borde de Progreso:** En Navbar, rodear avatar con anillo SVG que muestre nivel/sellos
- **Quick-View Drawer:** Click en avatar abre panel lateral con "Tarjeta de Identidad Holográfica"
- **FAB "Premio Disponible":** Botón flotante con animación de pulso cuando hay sellos canjeables

**Gamificación:**
- Conectar API de sellos a evento `OrderCompleted`
- Animación de "Estampado" visual + sonido al completar orden

### 2. Dashboard Pulpero: "La Cabina de Mando" (NERV Style)

**Concepto:** Bento Grid - todo visible en una pantalla sin scroll

**Módulos propuestos:**
1. **Semáforo de Estado (Grande):** Switch gigante ABIERTO/CERRADO
2. **Radar de Órdenes (Live Feed):** Lista vertical con Socket.IO + Web Audio API para sonido de timbre
3. **Stock "One-Tap":** Top 20 productos con switch SÍ/NO para disponibilidad rápida
4. **Métricas "Caja Chica":** Total vendido hoy en números grandes y dorados

### 3. Flujo de Compra: "La Canasta del Vecino"

**Propuestas:**
- **Bottom Sheet Carrito:** Panel que sube desde abajo (móvil), siempre visible
- **Barra de Progreso:** "Te faltan L. 50 para envío gratis"
- **Checkout One-Page:** Dirección + Pago + Nota en una sola vista
- **Order Tracking en Mapa:** Usar el mapa semántico existente con línea punteada neón

### 4. Referencias Visuales

**Estilo "Cyber-Barrio" (Glassmorphism Oscuro):**
- Fondos `#0f0f0f` o Slate-900
- Tarjetas semi-transparentes con `border-white/10`
- Rojo para acciones críticas, Dorado para recompensas

**Patrones de UI:**
| Área | Referencia |
|------|------------|
| Pasaporte | Apple Wallet, Steam Trading Cards |
| Dashboard | Uber Eats Merchant Tablet |
| Productos | Rappi Turbo |

### Quick Wins Técnicos (Gemini)

1. Crear componente `PassportModal` y anclarlo al Avatar del Header
2. Implementar `useEffect` en Dashboard para `new_order` + `new Audio('/sounds/bell.mp3').play()`
3. Mover enlace de `/passport` a lugar visible (Nav o Profile Dropdown)

---

## Decisiones Tomadas

**Capitán decidió:** "Arreglemos lo que no funciona, y poco a poco mejoremos lo que les pida"

---

## Cambios Realizados (2026-01-16)

### 1. Link al Pasaporte
- **Archivo:** `components/layout/Header.jsx`
- **Cambio:** Agregado link "Mi Pasaporte" en menú dropdown del usuario
- **Icono:** Hexagon (amber/dorado)

### 2. Sistema de Sonidos
- **Carpeta creada:** `public/sounds/`
- **Archivo:** `Dashboard.jsx` ahora usa `playNotificationSound('order')` con fallback a Web Audio API
- **README:** Agregado con instrucciones para agregar archivos de audio

### 3. Socket.IO Unificado
- **Archivo:** `ManageOrders.jsx`
- **Antes:** Creaba conexión manual con `io()` de socket.io-client
- **Después:** Usa `socketService` singleton
- **Beneficio:** Una sola conexión compartida, no duplicados

---

## Próximos Pasos

*(Según solicite el Capitán)*

---

## Notas Adicionales

**Advertencia de Claude:** Algunas de estas ideas son conceptuales y necesitan validación técnica antes de implementar. Se recomienda:
1. Priorizar los "Quick Wins" primero
2. Validar que la API de stamps funcione antes de integrar el pasaporte
3. Crear prototipos visuales antes de código final
