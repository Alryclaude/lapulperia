import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { getDistanceKm } from '../utils/geo.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Listar chambas con filtros
// ═══════════════════════════════════════════════════════════════

router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,           // EMPLOYMENT, SERVICE, REQUEST
      category,       // ChambaCategory
      search,
      latitude,
      longitude,
      radius = 10,    // km
      pulperiaId,
      limit = 20,
      offset = 0
    } = req.query;

    const where = {
      isActive: true
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (pulperiaId) where.pulperiaId = pulperiaId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const chambas = await prisma.chamba.findMany({
      where,
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            latitude: true,
            longitude: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: [
        { isUrgent: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Filtrar por distancia si se proporciona ubicación
    let filtered = chambas;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const maxDist = parseFloat(radius);

      filtered = chambas.filter(c => {
        const chambaLat = c.latitude || c.pulperia?.latitude;
        const chambaLng = c.longitude || c.pulperia?.longitude;
        if (!chambaLat || !chambaLng) return true; // Incluir sin ubicación

        const dist = getDistanceKm(lat, lng, chambaLat, chambaLng);
        return dist <= maxDist;
      }).map(c => ({
        ...c,
        distance: c.latitude || c.pulperia?.latitude
          ? getDistanceKm(lat, lng, c.latitude || c.pulperia?.latitude, c.longitude || c.pulperia?.longitude)
          : null
      }));
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching chambas:', error);
    res.status(500).json({ error: { message: 'Error al cargar chambas' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// PÚBLICO: Detalle de una chamba
// ═══════════════════════════════════════════════════════════════

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const chamba = await prisma.chamba.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            whatsapp: true,
            latitude: true,
            longitude: true,
            address: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true
          }
        },
        responses: req.user ? {
          where: { userId: req.user.id },
          select: { id: true, status: true }
        } : false,
        _count: {
          select: { responses: true }
        }
      }
    });

    if (!chamba) {
      return res.status(404).json({ error: { message: 'Chamba no encontrada' } });
    }

    // Incrementar contador de vistas
    await prisma.chamba.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(chamba);
  } catch (error) {
    console.error('Error fetching chamba:', error);
    res.status(500).json({ error: { message: 'Error al cargar chamba' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTENTICADO: Crear chamba
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, async (req, res) => {
  try {
    const {
      type,
      category,
      title,
      description,
      priceType,
      priceMin,
      priceMax,
      isPartTime,
      isUrgent,
      requirements,
      salary,
      duration,
      serviceArea,
      images,
      imagePublicIds,
      latitude,
      longitude,
      contactPhone,
      contactWhatsapp,
      expiresAt
    } = req.body;

    if (!type || !category || !title) {
      return res.status(400).json({
        error: { message: 'Tipo, categoría y título son requeridos' }
      });
    }

    // Verificar si el usuario tiene pulpería
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    const chamba = await prisma.chamba.create({
      data: {
        userId: req.user.id,
        pulperiaId: user.pulperia?.id || null,
        type,
        category,
        title,
        description,
        priceType: priceType || 'NEGOTIABLE',
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        isPartTime: isPartTime || false,
        isUrgent: isUrgent || false,
        requirements,
        salary,
        duration,
        serviceArea,
        images: images || [],
        imagePublicIds: imagePublicIds || [],
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        contactPhone: contactPhone || user.phone,
        contactWhatsapp: contactWhatsapp || user.pulperia?.whatsapp,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(chamba);
  } catch (error) {
    console.error('Error creating chamba:', error);
    res.status(500).json({ error: { message: 'Error al crear chamba' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTENTICADO: Actualizar chamba propia
// ═══════════════════════════════════════════════════════════════

router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.chamba.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Chamba no encontrada' } });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const {
      title,
      description,
      priceType,
      priceMin,
      priceMax,
      isPartTime,
      isUrgent,
      requirements,
      salary,
      duration,
      serviceArea,
      images,
      imagePublicIds,
      latitude,
      longitude,
      contactPhone,
      contactWhatsapp,
      isActive,
      expiresAt
    } = req.body;

    const chamba = await prisma.chamba.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        priceType,
        priceMin: priceMin !== undefined ? (priceMin ? parseFloat(priceMin) : null) : undefined,
        priceMax: priceMax !== undefined ? (priceMax ? parseFloat(priceMax) : null) : undefined,
        isPartTime,
        isUrgent,
        requirements,
        salary,
        duration,
        serviceArea,
        images,
        imagePublicIds,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : undefined,
        contactPhone,
        contactWhatsapp,
        isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json(chamba);
  } catch (error) {
    console.error('Error updating chamba:', error);
    res.status(500).json({ error: { message: 'Error al actualizar chamba' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTENTICADO: Eliminar chamba propia
// ═══════════════════════════════════════════════════════════════

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.chamba.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Chamba no encontrada' } });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    await prisma.chamba.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chamba:', error);
    res.status(500).json({ error: { message: 'Error al eliminar chamba' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// MIS CHAMBAS (como dueño)
// ═══════════════════════════════════════════════════════════════

router.get('/my/list', authenticate, async (req, res) => {
  try {
    const { type, status } = req.query;

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const chambas = await prisma.chamba.findMany({
      where,
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(chambas);
  } catch (error) {
    console.error('Error fetching my chambas:', error);
    res.status(500).json({ error: { message: 'Error al cargar mis chambas' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS A CHAMBAS
// ═══════════════════════════════════════════════════════════════

// Responder a una chamba (aplicar/cotizar)
router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const { message, proposedPrice, estimatedTime, cvUrl, cvPublicId } = req.body;

    const chamba = await prisma.chamba.findUnique({
      where: { id: req.params.id }
    });

    if (!chamba) {
      return res.status(404).json({ error: { message: 'Chamba no encontrada' } });
    }

    if (!chamba.isActive) {
      return res.status(400).json({ error: { message: 'Esta chamba ya no está activa' } });
    }

    // No puede responder a su propia chamba
    if (chamba.userId === req.user.id) {
      return res.status(400).json({ error: { message: 'No puedes responder a tu propia chamba' } });
    }

    // Verificar si ya respondió
    const existing = await prisma.chambaResponse.findUnique({
      where: {
        chambaId_userId: {
          chambaId: req.params.id,
          userId: req.user.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: { message: 'Ya has respondido a esta chamba' } });
    }

    const response = await prisma.chambaResponse.create({
      data: {
        chambaId: req.params.id,
        userId: req.user.id,
        message,
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        estimatedTime,
        cvUrl,
        cvPublicId
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true }
        }
      }
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Error responding to chamba:', error);
    res.status(500).json({ error: { message: 'Error al responder' } });
  }
});

// Ver respuestas de mi chamba
router.get('/:id/responses', authenticate, async (req, res) => {
  try {
    const chamba = await prisma.chamba.findUnique({
      where: { id: req.params.id }
    });

    if (!chamba) {
      return res.status(404).json({ error: { message: 'Chamba no encontrada' } });
    }

    if (chamba.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const responses = await prisma.chambaResponse.findMany({
      where: { chambaId: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: { message: 'Error al cargar respuestas' } });
  }
});

// Actualizar estado de respuesta (aceptar/rechazar)
router.put('/response/:responseId', authenticate, async (req, res) => {
  try {
    const { status, responseNote } = req.body;

    const response = await prisma.chambaResponse.findUnique({
      where: { id: req.params.responseId },
      include: { chamba: true }
    });

    if (!response) {
      return res.status(404).json({ error: { message: 'Respuesta no encontrada' } });
    }

    // Solo el dueño de la chamba puede actualizar respuestas
    if (response.chamba.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const updated = await prisma.chambaResponse.update({
      where: { id: req.params.responseId },
      data: { status, responseNote },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating response:', error);
    res.status(500).json({ error: { message: 'Error al actualizar respuesta' } });
  }
});

// Mis aplicaciones (chambas a las que he respondido)
router.get('/my/applications', authenticate, async (req, res) => {
  try {
    const responses = await prisma.chambaResponse.findMany({
      where: { userId: req.user.id },
      include: {
        chamba: {
          include: {
            pulperia: {
              select: { id: true, name: true, logo: true }
            },
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ error: { message: 'Error al cargar mis aplicaciones' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS (para el frontend)
// ═══════════════════════════════════════════════════════════════

router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'MECANICA', label: 'Mecánica', icon: 'Wrench' },
    { value: 'PLOMERIA', label: 'Plomería', icon: 'Droplet' },
    { value: 'ELECTRICIDAD', label: 'Electricidad', icon: 'Zap' },
    { value: 'CARPINTERIA', label: 'Carpintería', icon: 'Hammer' },
    { value: 'CELULARES', label: 'Celulares', icon: 'Smartphone' },
    { value: 'ELECTRODOMESTICOS', label: 'Electrodomésticos', icon: 'Tv' },
    { value: 'BARBERIA', label: 'Barbería', icon: 'Scissors' },
    { value: 'SALON_BELLEZA', label: 'Salón de Belleza', icon: 'Sparkles' },
    { value: 'MASAJES', label: 'Masajes', icon: 'Heart' },
    { value: 'LIMPIEZA', label: 'Limpieza', icon: 'Sparkle' },
    { value: 'JARDINERIA', label: 'Jardinería', icon: 'Flower' },
    { value: 'PINTURA', label: 'Pintura', icon: 'Paintbrush' },
    { value: 'MUDANZAS', label: 'Mudanzas', icon: 'Truck' },
    { value: 'COCINA', label: 'Cocina', icon: 'ChefHat' },
    { value: 'REPOSTERIA', label: 'Repostería', icon: 'Cake' },
    { value: 'CATERING', label: 'Catering', icon: 'UtensilsCrossed' },
    { value: 'VENTAS', label: 'Ventas', icon: 'ShoppingBag' },
    { value: 'ATENCION_CLIENTE', label: 'Atención al Cliente', icon: 'Headphones' },
    { value: 'TRANSPORTE', label: 'Transporte', icon: 'Car' },
    { value: 'DELIVERY', label: 'Delivery', icon: 'Bike' },
    { value: 'TUTORIA', label: 'Tutoría', icon: 'GraduationCap' },
    { value: 'FOTOGRAFIA', label: 'Fotografía', icon: 'Camera' },
    { value: 'OTRO', label: 'Otro', icon: 'MoreHorizontal' }
  ];

  res.json(categories);
});

export default router;
