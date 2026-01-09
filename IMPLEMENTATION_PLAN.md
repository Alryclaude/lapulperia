# Plan de Reparación y Refactorización - La Pulperia

## Resumen Ejecutivo

Auditoría completa del marketplace La Pulperia identificó **19 issues** organizados en 5 fases. El usuario eligió:
- ✅ Crear páginas básicas para los 6 enlaces muertos
- ✅ Implementar ambos TODOs (notificaciones + streak)
- ✅ Avanzar balanceado por fases

---

## Fase 1: Bugs Críticos (Funcionalidad Rota)

### 1.1 Agregar Métodos API Faltantes
**Archivo:** `client/src/services/api.js` (líneas 138-142)

```javascript
export const userApi = {
  getStats: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  exportData: () => api.get('/auth/export'),        // AGREGAR
  deleteAccount: () => api.delete('/auth/me'),      // AGREGAR
};
```

**Backend requerido:** Crear endpoint `GET /api/auth/export` en `server/src/routes/auth.js`

### 1.2 Fix Stale Closure en Favorite Toggle
**Archivo:** `client/src/pages/PulperiaProfile.jsx` (línea 45)

```javascript
// ANTES (bug)
toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');

// DESPUÉS (fix)
onSuccess: (response) => {
  queryClient.invalidateQueries(['pulperia', id]);
  toast.success(response.data.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
},
```

### 1.3 Fix Orden de Rutas en Services
**Archivo:** `server/src/routes/services.js`

Mover `/user/:userId` (línea 93) ANTES de `/:id` (línea 70):
```javascript
router.get('/user/:userId', optionalAuth, async (req, res) => { ... });  // PRIMERO
router.get('/:id', optionalAuth, async (req, res) => { ... });           // DESPUÉS
```

---

## Fase 2: Seguridad y Rendimiento

### 2.1 Fix Vulnerabilidad CSV Export
**Archivo:** `server/src/routes/stats.js` (líneas 328-339)

Crear función de escape CSV:
```javascript
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  // Prevenir formula injection
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  // Escapar si contiene comma, quote, o newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
```

### 2.2 Fix N+1 Query - Frequent Customers
**Archivo:** `server/src/routes/stats.js` (líneas 117-136)

Cambiar de loop individual a batch query:
```javascript
const userIds = frequentCustomers.map(c => c.userId);
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  select: { id: true, name: true, avatar: true },
});
const userMap = new Map(users.map(u => [u.id, u]));
```

### 2.3 Fix N+1 Query - Daily Revenue
**Archivo:** `server/src/routes/stats.js` (líneas 172-197)

Cambiar 7 queries secuenciales a 1 query + agrupación en JS.

### 2.4 Fix Distance Filtering
**Archivos:** `server/src/routes/products.js`, `pulperia.js`

Aplicar `limit` DESPUÉS del filtro de distancia, no antes.

### 2.5 Agregar Índices Faltantes
**Archivo:** `server/prisma/schema.prisma`

```prisma
model LoyaltyPoint {
  @@index([userId])
}

model OrderItem {
  @@index([productId])
}

model Review {
  @@index([userId])
}
```

---

## Fase 3: Nuevas Páginas y Features TODO

### 3.1 Crear 5 Páginas Nuevas + 1 Redirect

| Ruta | Archivo a Crear |
|------|-----------------|
| `/reviews` | `client/src/pages/MyReviews.jsx` |
| `/applications` | `client/src/pages/MyApplications.jsx` |
| `/profile/services` | Redirect a `/my-services` en App.jsx |
| `/settings/notifications` | `client/src/pages/NotificationSettings.jsx` |
| `/settings/privacy` | `client/src/pages/PrivacySettings.jsx` |
| `/help` | `client/src/pages/Help.jsx` |

**Backend:** Agregar `GET /api/reviews/my-reviews` en `server/src/routes/reviews.js`

### 3.2 Implementar Product Alert Notifications
**Archivo:** `server/src/routes/products.js` (línea 303)

```javascript
// Cuando producto vuelve a stock
const io = req.app.get('io');
for (const alert of alerts) {
  io.to(alert.userId).emit('product-back-in-stock', {
    productId: alert.productId,
    productName: alert.product.name,
    message: `¡${alert.product.name} ya está disponible!`,
  });
}
```

### 3.3 Implementar Streak Achievement
**Archivo:** `server/src/routes/orders.js` (línea 387)

Verificar 7 días consecutivos de entregas para desbloquear achievement `STREAK_7`.

---

## Fase 4: Validación y Status Codes

### 4.1 Agregar Validación de Inputs
- Instalar `zod` para validación
- Crear `server/src/middleware/validate.js`
- Validar: price > 0, quantity > 0, rating 1-5 entero, coordenadas válidas

### 4.2 Corregir HTTP Status Codes

| Escenario | Actual | Correcto |
|-----------|--------|----------|
| Ya aplicó a empleo | 400 | 409 Conflict |
| Ya dejó reseña | 400 | 409 Conflict |
| Ya tiene pulpería | 400 | 409 Conflict |
| Pulpería cerrada permanente | 400 | 410 Gone |

---

## Fase 5: Tech Debt

### 5.1 Optimizar Socket.IO Broadcasts
**Archivo:** `server/src/routes/pulperia.js` (línea 214)

Cambiar `io.emit()` (todos) a `io.to(userId).emit()` (solo interesados).

### 5.2 Limpiar Event Model
**Archivo:** `server/prisma/schema.prisma`

Eliminar modelo `Event` no usado (líneas 404-416).

---

## Archivos Críticos a Modificar

| Archivo | Cambios |
|---------|---------|
| `client/src/services/api.js` | +exportData, +deleteAccount |
| `client/src/pages/PulperiaProfile.jsx` | Fix stale closure |
| `client/src/App.jsx` | +6 rutas nuevas |
| `server/src/routes/auth.js` | +endpoint export |
| `server/src/routes/stats.js` | CSV security, N+1 fixes |
| `server/src/routes/services.js` | Reordenar rutas |
| `server/src/routes/products.js` | +notificaciones, distance fix |
| `server/src/routes/orders.js` | +streak tracking |
| `server/src/routes/reviews.js` | +my-reviews endpoint |
| `server/prisma/schema.prisma` | +3 índices, -Event model |

---

## Verificación Final - COMPLETADO 2026-01-08

### Código Implementado:
- [x] userApi.exportData() y deleteAccount() agregados
- [x] Endpoint GET /api/auth/export creado
- [x] Stale closure en favorite toggle arreglado
- [x] Rutas de services.js reordenadas
- [x] Función escapeCSV para seguridad CSV
- [x] N+1 query de frequent customers optimizado
- [x] N+1 query de daily revenue optimizado
- [x] Distance filtering con limit post-filtro
- [x] 3 índices de BD agregados (LoyaltyPoint, OrderItem, Review)
- [x] 5 páginas nuevas + 1 redirect creados
- [x] Product Alert Notifications via Socket.IO
- [x] Streak Achievement tracking (7 días)
- [x] Validación de inputs (price > 0, quantity > 0)
- [x] HTTP status codes corregidos (409, 410)
- [x] Socket.IO broadcasts optimizados (targeted emit)

### Pendiente (requiere migración de BD):
- [ ] Eliminar Event model no usado

### Para probar manualmente:
- [ ] Login/logout funciona
- [ ] Exportar datos descarga JSON
- [ ] Eliminar cuenta funciona y redirige
- [ ] Toggle favorito muestra mensaje correcto
- [ ] Todos los enlaces de Profile funcionan
- [ ] Dashboard carga rápido (sin N+1)
- [ ] CSV con caracteres especiales no se corrompe
- [ ] Validación rechaza precios negativos
- [ ] Duplicados retornan 409

---

## Orden de Ejecución

1. **Fase 1** → Arregla funcionalidad rota inmediatamente
2. **Fase 2** → Seguridad y performance
3. **Fase 3** → Nuevas páginas y features
4. **Fase 4** → Validación y códigos HTTP
5. **Fase 5** → Limpieza técnica
