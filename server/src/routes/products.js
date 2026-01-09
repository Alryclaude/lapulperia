import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadProduct, deleteImage } from '../services/cloudinary.js';

const router = express.Router();

// Search products across all pulperias
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, lat, lng, radius = 5000, inStock, limit = 50 } = req.query;

    if (!q) {
      return res.status(400).json({ error: { message: 'Se requiere término de búsqueda' } });
    }

    const where = {
      isAvailable: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
      pulperia: {
        isPermanentlyClosed: false,
      },
    };

    if (inStock === 'true') {
      where.outOfStock = false;
    }

    // Si hay coordenadas, no aplicar limit en query (aplicar después del filtro de distancia)
    const hasCoordinates = lat && lng;

    let products = await prisma.product.findMany({
      where,
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            latitude: true,
            longitude: true,
            status: true,
            rating: true,
          },
        },
      },
      // Solo aplicar limit si NO hay filtro de distancia
      ...(!hasCoordinates && { take: parseInt(limit) }),
    });

    // Filter and sort by distance if coordinates provided
    if (hasCoordinates) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      products = products.filter((p) => {
        const distance = getDistance(userLat, userLng, p.pulperia.latitude, p.pulperia.longitude);
        p.distance = distance;
        return distance <= maxRadius;
      });

      products.sort((a, b) => a.distance - b.distance);

      // Aplicar limit DESPUÉS del filtro de distancia
      products = products.slice(0, parseInt(limit));
    }

    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: { message: 'Error al buscar productos' } });
  }
});

// Get my products (pulperia owner)
router.get('/my-products', authenticate, requirePulperia, async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      pulperiaId: req.user.pulperia.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    res.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: { message: 'Error al obtener productos' } });
  }
});

// Get products by pulperia
router.get('/pulperia/:pulperiaId', optionalAuth, async (req, res) => {
  try {
    const { category, inStock, featured } = req.query;

    const where = {
      pulperiaId: req.params.pulperiaId,
      isAvailable: true,
    };

    if (category) {
      where.category = category;
    }

    if (inStock === 'true') {
      where.outOfStock = false;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    // Get unique categories
    const categories = await prisma.product.findMany({
      where: { pulperiaId: req.params.pulperiaId, isAvailable: true },
      select: { category: true },
      distinct: ['category'],
    });

    res.json({
      products,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: { message: 'Error al obtener productos' } });
  }
});

// Get single product
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        viewsToday: { increment: 1 },
        totalViews: { increment: 1 },
      },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            status: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: { message: 'Error al obtener producto' } });
  }
});

// Create product (pulperia only)
router.post('/', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isSeasonal, seasonalTag } = req.body;

    // Validación de inputs
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: { message: 'El nombre del producto es requerido' } });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: { message: 'El precio debe ser mayor a 0' } });
    }

    if (!req.file) {
      return res.status(400).json({ error: { message: 'Se requiere imagen del producto' } });
    }

    const product = await prisma.product.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
        isSeasonal: isSeasonal === 'true',
        seasonalTag,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: { message: 'Error al crear producto' } });
  }
});

// Update product
router.patch('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    const { name, description, price, category, isAvailable, isFeatured, isSeasonal, seasonalTag } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category !== undefined && { category }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isSeasonal !== undefined && { isSeasonal }),
        ...(seasonalTag !== undefined && { seasonalTag }),
      },
    });

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar producto' } });
  }
});

// Update product image
router.patch('/:id/image', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    if (!req.file) {
      return res.status(400).json({ error: { message: 'Se requiere imagen' } });
    }

    // Delete old image
    if (product.imagePublicId) {
      await deleteImage(product.imagePublicId);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
      },
    });

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product image error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar imagen' } });
  }
});

// Toggle out of stock
router.patch('/:id/stock', authenticate, requirePulperia, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        outOfStock: !product.outOfStock,
      },
    });

    // Notify users who have alerts for this product
    if (!updatedProduct.outOfStock) {
      const alerts = await prisma.productAlert.findMany({
        where: { productId: req.params.id, notified: false },
        include: { user: true },
      });

      // Enviar notificaciones via Socket.IO
      if (alerts.length > 0) {
        const io = req.app.get('io');
        const pulperia = await prisma.pulperia.findUnique({
          where: { id: req.user.pulperia.id },
          select: { name: true },
        });

        alerts.forEach(alert => {
          io.to(alert.userId).emit('product-back-in-stock', {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            productImage: updatedProduct.image,
            pulperiaId: req.user.pulperia.id,
            pulperiaName: pulperia?.name,
            message: `¡${updatedProduct.name} ya está disponible en ${pulperia?.name}!`,
          });
        });
      }

      await prisma.productAlert.updateMany({
        where: { productId: req.params.id },
        data: { notified: true },
      });
    }

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Toggle stock error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar stock' } });
  }
});

// Toggle featured (producto del día)
router.patch('/:id/featured', authenticate, requirePulperia, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    // Check how many featured products already
    const featuredCount = await prisma.product.count({
      where: {
        pulperiaId: req.user.pulperia.id,
        isFeatured: true,
        id: { not: req.params.id },
      },
    });

    if (featuredCount >= 3 && !product.isFeatured) {
      return res.status(400).json({ error: { message: 'Máximo 3 productos destacados' } });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        isFeatured: !product.isFeatured,
        featuredUntil: !product.isFeatured ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        viewsToday: !product.isFeatured ? 0 : product.viewsToday,
      },
    });

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: { message: 'Error al destacar producto' } });
  }
});

// Delete product
router.delete('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    // Delete image from cloudinary
    if (product.imagePublicId) {
      await deleteImage(product.imagePublicId);
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar producto' } });
  }
});

// Create product alert (avisame cuando llegue)
router.post('/:id/alert', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    await prisma.productAlert.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: req.params.id,
        },
      },
      update: { notified: false },
      create: {
        userId: req.user.id,
        productId: req.params.id,
      },
    });

    res.json({ message: 'Te avisaremos cuando llegue' });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: { message: 'Error al crear alerta' } });
  }
});

// Helper function
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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
