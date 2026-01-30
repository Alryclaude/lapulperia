# Análisis UX/UI - La Pulpería
> Fecha: 2026-01-30 | Analista: Gemini + Claude

---

## 🔴 Problemas UX Prioritarios

### 1. Carga Cognitiva en Bottom Nav
- **Problema**: "Anuncios" y "Chambas" junto a compra diluye el propósito principal
- **Impacto**: Usuario que busca comida no busca empleo
- **Solución**: Mover Chambas/Anuncios a menú secundario o tab dentro de perfil

### 2. Fricción de Geolocalización
- **Problema**: Mapa vacío de entrada es "vía muerta"
- **Impacto**: Si GPS falla, usuario siente que la app no sirve
- **Solución**: Mostrar contenido alternativo (productos populares, pulperías destacadas)

### 3. Jerarquía de FAQ
- **Problema**: Acordeón FAQ en flujo principal de inicio
- **Impacto**: Roba espacio para descubrimiento de productos
- **Solución**: Mover a página /help o footer

### 4. Ambigüedad Toggle "Online"
- **Problema**: "Pulpe online" no es concepto claro en Honduras
- **Impacto**: Confusión sobre qué significa (¿envío? ¿sin local?)
- **Solución**: Renombrar a "Delivery" o "A domicilio" con tooltip explicativo

### 5. Accesibilidad del Rojo Primario
- **Problema**: Rojo (#FA5252) sobre fondo casi negro causa fatiga visual
- **Impacto**: Asociación cultural con "error" o "peligro"
- **Solución**: Usar rojo solo para CTAs críticos, considerar tono más coral

---

## 🎨 Mejoras Visuales Concretas

### 1. Suavizado de Fondo
```css
/* Degradado radial sutil */
background: radial-gradient(ellipse at 50% 0%, #1A1A24 0%, #0F0F14 70%);
```

### 2. Elevación de Tarjetas
```css
/* Bordes sutiles en lugar de sombras */
border: 1px solid #2A2A35;
/* En hover */
border-color: rgba(250, 82, 82, 0.2);
```

### 3. Tipografía con Sabor Local
- **Cuerpo**: Inter (legibilidad)
- **Encabezados**: Outfit o Montserrat Bold (moderno pero cercano)

### 4. Iconografía de Acento
- Dorado (#FBBF24) **solo** para:
  - Estrellas de rating
  - Insignias "Pulpe Verificada"
  - Ofertas especiales

### 5. Micro-interacciones
```jsx
// Framer Motion en botones
whileTap={{ scale: 0.98 }}
whileHover={{ scale: 1.02 }}
transition={{ type: "spring", stiffness: 400 }}
```

---

## 📭 Empty State Mejorado

### Cuando no hay pulperías cerca:

1. **Ilustración Local**
   - Dibujo lineal de pulpería hondureña
   - Estilo casas de Valle de Ángeles
   - Rótulo "Cerrado por ahora"

2. **Acciones Proactivas**
   - "🔔 Avísame cuando haya pulpes cerca"
   - "📨 Invita a tu pulpería favorita"

3. **Contenido Alternativo**
   - "Productos más buscados en Honduras"
   - Grid con: Maseca, Café, Frijoles, Pan, etc.
   - Mantiene interés de compra

4. **Skeleton Screens**
   - Placeholders animados antes de "No hay resultados"
   - Evita sensación de app vacía

---

## 💡 Propuesta de Valor Visible

### 1. Micro-copy Hondureño
| Actual | Propuesto |
|--------|-----------|
| Carrito | Mi Mandadito |
| Buscar productos | ¿Qué vas a comprar hoy? |
| Registrar mi pulpería | Súmate al movimiento |

### 2. Distintivo de Confianza
```
📌 "Precios de barrio, sin recargos ocultos"
```

### 3. Segmentación Clara
- Banner superior para dueños: "¿Sos dueño de pulpe? Registrate aquí →"
- Separado visualmente del flujo comprador

### 4. Social Proof Dinámico
```jsx
<Badge>🏪 50 pulperías activas en Tegucigalpa hoy</Badge>
```

---

## 📋 Priorización de Implementación

### Fase 1 - Quick Wins (Esta noche)
- [ ] Mover FAQ fuera del home
- [ ] Agregar micro-copy hondureño
- [ ] Mejorar empty state con contenido alternativo
- [ ] Ajustar micro-interacciones en botones

### Fase 2 - Mejoras Visuales (Próxima sesión)
- [ ] Implementar degradado de fondo
- [ ] Actualizar bordes de tarjetas
- [ ] Agregar social proof counter
- [ ] Renombrar "Online" a "Delivery"

### Fase 3 - Restructuración (Con Ale)
- [ ] Reorganizar bottom nav
- [ ] Crear ilustración empty state personalizada
- [ ] Evaluar cambio de color primario

---

## 🔗 Referencias

- [Paleta Constelación de Barrio](../client/tailwind.config.js)
- [Componentes Home](../client/src/components/home/)
- [Estado actual del sitio](https://lapulperiastore.net)
