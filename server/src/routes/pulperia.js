import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadLogo, uploadBanner, uploadStory, deleteImage } from '../services/cloudinary.js';

const router = express.Router();

// Get all pulperias (with filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 5000, // metros
      status,
      category,
      search,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {
      isPermanentlyClosed: false,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Si hay coordenadas, no aplicar limit/offset en query (aplicar después del filtro)
    const hasCoordinates = lat && lng;

    let pulperias = await prisma.pulperia.findMany({
      where,
      include: {
        user: {
          select: { name: true, avatar: true },
        },
        _count: {
          select: { products: true, reviews: true },
        },
      },
      // Solo aplicar limit/offset si NO hay filtro de distancia
      ...(!hasCoordinates && { take: parseInt(limit), skip: parseInt(offset) }),
      orderBy: { rating: 'desc' },
    });

    // Filter by distance if coordinates provided
    if (hasCoordinates) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      pulperias = pulperias.filter((p) => {
        const distance = getDistance(userLat, userLng, p.latitude, p.longitude);
        p.distance = distance;
        return distance <= maxRadius;
      });

      // Sort by distance
      pulperias.sort((a, b) => a.distance - b.distance);

      // Aplicar paginación DESPUÉS del filtro de distancia
      const start = parseInt(offset);
      const end = start + parseInt(limit);
      pulperias = pulperias.slice(start, end);
    }

    res.json({ pulperias });
  } catch (error) {
    console.error('Get pulperias error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pulperías' } });
  }
});

// IMPORTANTE: Rutas específicas DEBEN ir antes de /:id para evitar conflictos

// Get user's favorite pulperias
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        pulperia: {
          include: {
            _count: { select: { products: true, reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      pulperias: favorites.map((f) => ({
        ...f.pulperia,
        isFavorite: true,
      })),
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: { message: 'Error al obtener favoritos' } });
  }
});

// Get my pulperia
router.get('/me', authenticate, requirePulperia, async (req, res) => {
  try {
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: req.user.pulperia.id },
      include: {
        user: {
          select: { name: true, avatar: true, email: true },
        },
        achievements: true,
        loyaltyProgram: true,
        _count: {
          select: { products: true, reviews: true, orders: true },
        },
      },
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Get my pulperia error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pulpería' } });
  }
});

// Get single pulperia (DEBE ir después de rutas específicas como /favorites y /me)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
        products: {
          where: { isAvailable: true },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        achievements: true,
        loyaltyProgram: true,
        _count: {
          select: { products: true, reviews: true, orders: true },
        },
      },
    });

    if (!pulperia) {
      return res.status(404).json({ error: { message: 'Pulpería no encontrada' } });
    }

    // Check if user has favorited
    let isFavorite = false;
    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_pulperiaId: {
            userId: req.user.id,
            pulperiaId: pulperia.id,
          },
        },
      });
      isFavorite = !!favorite;
    }

    res.json({ pulperia, isFavorite });
  } catch (error) {
    console.error('Get pulperia error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pulpería' } });
  }
});

// Update pulperia profile
router.patch('/me', authenticate, requirePulperia, async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      whatsapp,
      address,
      reference,
      latitude,
      longitude,
      acceptsDelivery,
      acceptsPickup,
      foundedYear,
      story,
      isOnlineOnly,
    } = req.body;

    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(address && { address }),
        ...(reference !== undefined && { reference }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(acceptsDelivery !== undefined && { acceptsDelivery }),
        ...(acceptsPickup !== undefined && { acceptsPickup }),
        ...(foundedYear !== undefined && { foundedYear }),
        ...(story !== undefined && { story }),
        ...(isOnlineOnly !== undefined && { isOnlineOnly }),
      },
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Update pulperia error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar pulpería' } });
  }
});

// Update pulperia status (open/closed)
router.patch('/me/status', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status, vacationMessage, vacationUntil } = req.body;

    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        status,
        statusChangedAt: new Date(),
        ...(vacationMessage !== undefined && { vacationMessage }),
        ...(vacationUntil && { vacationUntil: new Date(vacationUntil) }),
      },
    });

    // Emit socket event solo a usuarios interesados (que tienen notifyOnOpen)
    const io = req.app.get('io');
    const interestedUsers = await prisma.favorite.findMany({
      where: {
        pulperiaId: pulperia.id,
        notifyOnOpen: true,
      },
      select: { userId: true },
    });

    interestedUsers.forEach(fav => {
      io.to(fav.userId).emit('pulperia-status-changed', {
        pulperiaId: pulperia.id,
        pulperiaName: pulperia.name,
        status: pulperia.status,
        message: status === 'OPEN'
          ? `¡${pulperia.name} ya está abierta!`
          : `${pulperia.name} cambió su estado a ${status}`,
      });
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar estado' } });
  }
});

// Upload logo
router.post('/me/logo', authenticate, requirePulperia, uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No se proporcionó imagen' } });
    }

    // Delete old logo if exists
    if (req.user.pulperia.logoPublicId) {
      await deleteImage(req.user.pulperia.logoPublicId);
    }

    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        logo: req.file.path,
        logoPublicId: req.file.filename,
      },
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: { message: 'Error al subir logo' } });
  }
});

// Upload banner
router.post('/me/banner', authenticate, requirePulperia, uploadBanner.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No se proporcionó imagen' } });
    }

    // Delete old banner if exists
    if (req.user.pulperia.bannerPublicId) {
      await deleteImage(req.user.pulperia.bannerPublicId);
    }

    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        banner: req.file.path,
        bannerPublicId: req.file.filename,
      },
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({ error: { message: 'Error al subir banner' } });
  }
});

// Upload story images
router.post('/me/story-images', authenticate, requirePulperia, uploadStory.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'No se proporcionaron imágenes' } });
    }

    const imageUrls = req.files.map(f => f.path);

    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        storyImages: {
          push: imageUrls,
        },
      },
    });

    res.json({ pulperia });
  } catch (error) {
    console.error('Upload story images error:', error);
    res.status(500).json({ error: { message: 'Error al subir imágenes' } });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const { notifyOnOpen } = req.body;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_pulperiaId: {
          userId: req.user.id,
          pulperiaId: req.params.id,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return res.json({ isFavorite: false });
    }

    await prisma.favorite.create({
      data: {
        userId: req.user.id,
        pulperiaId: req.params.id,
        notifyOnOpen: notifyOnOpen || false,
      },
    });

    res.json({ isFavorite: true });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar favorito' } });
  }
});

// Close pulperia permanently
router.post('/me/close', authenticate, requirePulperia, async (req, res) => {
  try {
    const pulperia = await prisma.pulperia.update({
      where: { id: req.user.pulperia.id },
      data: {
        isPermanentlyClosed: true,
        status: 'CLOSED',
      },
    });

    res.json({ pulperia, message: 'Pulpería cerrada permanentemente' });
  } catch (error) {
    console.error('Close pulperia error:', error);
    res.status(500).json({ error: { message: 'Error al cerrar pulpería' } });
  }
});

// Setup loyalty program
router.post('/me/loyalty', authenticate, requirePulperia, async (req, res) => {
  try {
    const { pointsPerPurchase, rewardThreshold, rewardDescription, isActive } = req.body;

    const loyaltyProgram = await prisma.loyaltyProgram.upsert({
      where: { pulperiaId: req.user.pulperia.id },
      update: {
        pointsPerPurchase,
        rewardThreshold,
        rewardDescription,
        isActive,
      },
      create: {
        pulperiaId: req.user.pulperia.id,
        pointsPerPurchase: pointsPerPurchase || 1,
        rewardThreshold: rewardThreshold || 10,
        rewardDescription: rewardDescription || 'Un regalo especial',
        isActive: isActive !== false,
      },
    });

    res.json({ loyaltyProgram });
  } catch (error) {
    console.error('Setup loyalty error:', error);
    res.status(500).json({ error: { message: 'Error al configurar programa de lealtad' } });
  }
});

// Helper function to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default router;
