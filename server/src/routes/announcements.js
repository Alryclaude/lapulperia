import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadProduct, deleteImage } from '../services/cloudinary.js';

const router = express.Router();

// Constantes
const MAX_ACTIVE_ANNOUNCEMENTS = 3;
const ANNOUNCEMENT_DURATION_DAYS = 7;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Feed de anuncios locales (REQUIERE geolocalización)
// GET /api/announcements?lat=14.0818&lng=-87.2068&radius=2
// ═══════════════════════════════════════════════════════════════

router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      latitude,
      lat,           // Alias
      longitude,
      lng,           // Alias
      radius = 2,    // km (default 2km)
      limit = 30,
      offset = 0
    } = req.query;

    const userLat = parseFloat(latitude || lat);
    const userLng = parseFloat(longitude || lng);

    // Geolocalización es obligatoria para este feed
    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        error: { message: 'Se requiere ubicación (lat/lng) para ver anuncios cercanos' }
      });
    }

    const maxRadius = parseFloat(radius);
    const now = new Date();

    // Obtener anuncios activos no expirados
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now }
      },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            whatsapp: true,
            phone: true,
            latitude: true,
            longitude: true,
            address: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Filtrar por distancia y calcular distancia para cada anuncio
    const filtered = announcements
      .filter(a => {
        if (!a.pulperia?.latitude || !a.pulperia?.longitude) return false;
        const dist = getDistanceKm(userLat, userLng, a.pulperia.latitude, a.pulperia.longitude);
        return dist <= maxRadius;
      })
      .map(a => ({
        ...a,
        distance: Math.round(getDistanceKm(userLat, userLng, a.pulperia.latitude, a.pulperia.longitude) * 1000) // metros
      }))
      .sort((a, b) => a.distance - b.distance);

    // Paginación
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      announcements: paginated,
      total: filtered.length,
      radius: maxRadius,
      location: { lat: userLat, lng: userLng }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: { message: 'Error al cargar anuncios' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PULPERÍA: Mis anuncios
// GET /api/announcements/mine
// ═══════════════════════════════════════════════════════════════

router.get('/mine', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status } = req.query; // 'active' | 'expired' | 'all'
    const now = new Date();

    const where = { pulperiaId: req.user.pulperia.id };

    if (status === 'active') {
      where.isActive = true;
      where.expiresAt = { gt: now };
    } else if (status === 'expired') {
      where.OR = [
        { isActive: false },
        { expiresAt: { lte: now } }
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Contar activos y expirados
    const activeCount = await prisma.announcement.count({
      where: {
        pulperiaId: req.user.pulperia.id,
        isActive: true,
        expiresAt: { gt: now }
      }
    });

    const expiredCount = await prisma.announcement.count({
      where: {
        pulperiaId: req.user.pulperia.id,
        OR: [
          { isActive: false },
          { expiresAt: { lte: now } }
        ]
      }
    });

    res.json({
      announcements,
      counts: {
        active: activeCount,
        expired: expiredCount,
        maxAllowed: MAX_ACTIVE_ANNOUNCEMENTS
      }
    });
  } catch (error) {
    console.error('Error fetching my announcements:', error);
    res.status(500).json({ error: { message: 'Error al cargar mis anuncios' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Anuncios de una pulpería específica
// GET /api/announcements/pulperia/:pulperiaId
// ═══════════════════════════════════════════════════════════════

router.get('/pulperia/:pulperiaId', optionalAuth, async (req, res) => {
  try {
    const { pulperiaId } = req.params;
    const now = new Date();

    // Obtener anuncios activos y no expirados de esta pulpería
    const announcements = await prisma.announcement.findMany({
      where: {
        pulperiaId,
        isActive: true,
        expiresAt: { gt: now }
      },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            whatsapp: true,
            phone: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      announcements,
      total: announcements.length
    });
  } catch (error) {
    console.error('Error fetching pulperia announcements:', error);
    res.status(500).json({ error: { message: 'Error al cargar anuncios de la pulpería' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Detalle de un anuncio
// GET /api/announcements/:id
// ═══════════════════════════════════════════════════════════════

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            whatsapp: true,
            phone: true,
            latitude: true,
            longitude: true,
            address: true,
            reference: true
          }
        }
      }
    });

    if (!announcement) {
      return res.status(404).json({ error: { message: 'Anuncio no encontrado' } });
    }

    // Incrementar contador de vistas
    await prisma.announcement.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: { message: 'Error al cargar anuncio' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PULPERÍA: Crear anuncio
// POST /api/announcements
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const { title, description, price, imageAspectRatio } = req.body;
    const now = new Date();

    // Validar título
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: { message: 'El título es requerido' } });
    }

    if (title.length > 60) {
      return res.status(400).json({ error: { message: 'El título no puede exceder 60 caracteres' } });
    }

    // Validar imagen
    if (!req.file) {
      return res.status(400).json({ error: { message: 'La imagen es requerida' } });
    }

    // Verificar límite de anuncios activos
    const activeCount = await prisma.announcement.count({
      where: {
        pulperiaId: req.user.pulperia.id,
        isActive: true,
        expiresAt: { gt: now }
      }
    });

    if (activeCount >= MAX_ACTIVE_ANNOUNCEMENTS) {
      // Eliminar imagen subida
      if (req.file.public_id) {
        await deleteImage(req.file.public_id);
      }
      return res.status(400).json({
        error: {
          message: `Ya tienes ${MAX_ACTIVE_ANNOUNCEMENTS} anuncios activos. Elimina o espera a que expiren para crear más.`
        }
      });
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ANNOUNCEMENT_DURATION_DAYS);

    const announcement = await prisma.announcement.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        title: title.trim(),
        description: description?.trim() || null,
        price: price ? parseFloat(price) : null,
        imageUrl: req.file.secure_url,
        imagePublicId: req.file.public_id,
        imageAspectRatio: imageAspectRatio ? parseFloat(imageAspectRatio) : 1.0,
        expiresAt
      },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            whatsapp: true
          }
        }
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    // Limpiar imagen si hubo error
    if (req.file?.public_id) {
      await deleteImage(req.file.public_id).catch(console.error);
    }
    res.status(500).json({ error: { message: 'Error al crear anuncio' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PULPERÍA: Actualizar anuncio
// PATCH /api/announcements/:id
// ═══════════════════════════════════════════════════════════════

router.patch('/:id', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Anuncio no encontrado' } });
    }

    if (existing.pulperiaId !== req.user.pulperia.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const { title, description, price, imageAspectRatio, isActive } = req.body;
    const updateData = {};

    if (title !== undefined) {
      if (title.length > 60) {
        return res.status(400).json({ error: { message: 'El título no puede exceder 60 caracteres' } });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (price !== undefined) {
      updateData.price = price ? parseFloat(price) : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === 'true';
    }

    // Si hay nueva imagen
    if (req.file) {
      // Eliminar imagen anterior
      if (existing.imagePublicId) {
        await deleteImage(existing.imagePublicId).catch(console.error);
      }
      updateData.imageUrl = req.file.secure_url;
      updateData.imagePublicId = req.file.public_id;
      if (imageAspectRatio) {
        updateData.imageAspectRatio = parseFloat(imageAspectRatio);
      }
    }

    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            whatsapp: true
          }
        }
      }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: { message: 'Error al actualizar anuncio' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PULPERÍA: Eliminar anuncio
// DELETE /api/announcements/:id
// ═══════════════════════════════════════════════════════════════

router.delete('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Anuncio no encontrado' } });
    }

    if (existing.pulperiaId !== req.user.pulperia.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    // Eliminar imagen de Cloudinary
    if (existing.imagePublicId) {
      await deleteImage(existing.imagePublicId).catch(console.error);
    }

    await prisma.announcement.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: { message: 'Error al eliminar anuncio' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PULPERÍA: Renovar anuncio (+7 días)
// POST /api/announcements/:id/renew
// ═══════════════════════════════════════════════════════════════

router.post('/:id/renew', authenticate, requirePulperia, async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Anuncio no encontrado' } });
    }

    if (existing.pulperiaId !== req.user.pulperia.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    // Calcular nueva fecha de expiración desde ahora
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + ANNOUNCEMENT_DURATION_DAYS);

    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        expiresAt: newExpiresAt,
        isActive: true
      }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error renewing announcement:', error);
    res.status(500).json({ error: { message: 'Error al renovar anuncio' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Registrar contacto (click en WhatsApp)
// POST /api/announcements/:id/contact
// ═══════════════════════════════════════════════════════════════

router.post('/:id/contact', optionalAuth, async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Anuncio no encontrado' } });
    }

    await prisma.announcement.update({
      where: { id: req.params.id },
      data: { contactCount: { increment: 1 } }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error registering contact:', error);
    res.status(500).json({ error: { message: 'Error al registrar contacto' } });
  }
});

export default router;
