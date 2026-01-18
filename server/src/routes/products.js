import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadProduct, deleteImage } from '../services/cloudinary.js';
import { getDistance } from '../utils/geo.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Search products across all pulperias
router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
  const { q, lat, lng, radius = 5000, inStock, limit = 50 } = req.query;

  if (!q) {
    throw Errors.badRequest('Se requiere término de búsqueda');
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
    ...(!hasCoordinates && { take: parseInt(limit) }),
  });

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
    products = products.slice(0, parseInt(limit));
  }

  res.json({ products });
}));

// Get my products (pulperia owner)
router.get('/my-products', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const { search } = req.query;

  const where = { pulperiaId: req.user.pulperia.id };

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
}));

// Get products by pulperia
router.get('/pulperia/:pulperiaId', optionalAuth, asyncHandler(async (req, res) => {
  const { category, inStock, featured } = req.query;

  const where = {
    pulperiaId: req.params.pulperiaId,
    isAvailable: true,
  };

  if (category) where.category = category;
  if (inStock === 'true') where.outOfStock = false;
  if (featured === 'true') where.isFeatured = true;

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });

  const categories = await prisma.product.findMany({
    where: { pulperiaId: req.params.pulperiaId, isAvailable: true },
    select: { category: true },
    distinct: ['category'],
  });

  res.json({
    products,
    categories: categories.map((c) => c.category).filter(Boolean),
  });
}));

// Get single product
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
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
    throw Errors.notFound('Producto');
  }

  res.json({ product });
}));

// Create product (pulperia only)
router.post('/', authenticate, requirePulperia, uploadProduct.single('image'), asyncHandler(async (req, res) => {
  const { name, description, price, category, isSeasonal, seasonalTag } = req.body;

  if (!name || name.trim().length === 0) {
    throw Errors.badRequest('El nombre del producto es requerido');
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    throw Errors.badRequest('El precio debe ser mayor a 0');
  }

  if (!req.file) {
    throw Errors.badRequest('Se requiere imagen del producto');
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
}));

// Update product
router.patch('/:id', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
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
}));

// Update product image
router.patch('/:id/image', authenticate, requirePulperia, uploadProduct.single('image'), asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  if (!req.file) {
    throw Errors.badRequest('Se requiere imagen');
  }

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
}));

// Toggle out of stock
router.patch('/:id/stock', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  const updatedProduct = await prisma.product.update({
    where: { id: req.params.id },
    data: { outOfStock: !product.outOfStock },
  });

  // Notify users who have alerts for this product
  if (!updatedProduct.outOfStock) {
    const alerts = await prisma.productAlert.findMany({
      where: { productId: req.params.id, notified: false },
      include: { user: true },
    });

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
          productImage: updatedProduct.imageUrl,
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
}));

// Update stock quantity
router.patch('/:id/stock-quantity', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  const { stockQuantity, lowStockAlert, sku } = req.body;
  const shouldBeOutOfStock = stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0;
  const wasOutOfStock = product.outOfStock;

  const updatedProduct = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(stockQuantity !== undefined && { stockQuantity: stockQuantity !== null ? parseInt(stockQuantity) : null }),
      ...(lowStockAlert !== undefined && { lowStockAlert: lowStockAlert !== null ? parseInt(lowStockAlert) : null }),
      ...(sku !== undefined && { sku }),
      ...(shouldBeOutOfStock !== undefined && { outOfStock: shouldBeOutOfStock }),
    },
  });

  // If product came back in stock, notify users
  if (wasOutOfStock && !updatedProduct.outOfStock) {
    const alerts = await prisma.productAlert.findMany({
      where: { productId: req.params.id, notified: false },
    });

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
          productImage: updatedProduct.imageUrl,
          pulperiaId: req.user.pulperia.id,
          pulperiaName: pulperia?.name,
          message: `¡${updatedProduct.name} ya está disponible en ${pulperia?.name}!`,
        });
      });

      await prisma.productAlert.updateMany({
        where: { productId: req.params.id },
        data: { notified: true },
      });
    }
  }

  res.json({ product: updatedProduct });
}));

// Get low stock products
router.get('/low-stock', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      pulperiaId: req.user.pulperia.id,
      isAvailable: true,
      OR: [
        { outOfStock: true },
        {
          AND: [
            { stockQuantity: { not: null } },
            { lowStockAlert: { not: null } },
          ],
        },
      ],
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const lowStockProducts = products.filter((p) => {
    if (p.outOfStock) return true;
    if (p.stockQuantity !== null && p.lowStockAlert !== null) {
      return p.stockQuantity <= p.lowStockAlert;
    }
    return false;
  });

  res.json({ products: lowStockProducts });
}));

// Bulk stock update
router.post('/bulk-stock', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw Errors.badRequest('Se requiere un array de actualizaciones');
  }

  const productIds = updates.map((u) => u.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      pulperiaId: req.user.pulperia.id,
    },
  });

  if (products.length !== productIds.length) {
    throw Errors.badRequest('Algunos productos no fueron encontrados');
  }

  const results = await Promise.all(
    updates.map(async (update) => {
      const shouldBeOutOfStock = update.stockQuantity !== null && update.stockQuantity !== undefined && update.stockQuantity <= 0;

      return prisma.product.update({
        where: { id: update.productId },
        data: {
          ...(update.stockQuantity !== undefined && { stockQuantity: update.stockQuantity !== null ? parseInt(update.stockQuantity) : null }),
          ...(update.lowStockAlert !== undefined && { lowStockAlert: update.lowStockAlert !== null ? parseInt(update.lowStockAlert) : null }),
          outOfStock: shouldBeOutOfStock,
        },
      });
    })
  );

  res.json({ products: results, updated: results.length });
}));

// Toggle featured (producto del día)
router.patch('/:id/featured', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  const featuredCount = await prisma.product.count({
    where: {
      pulperiaId: req.user.pulperia.id,
      isFeatured: true,
      id: { not: req.params.id },
    },
  });

  if (featuredCount >= 3 && !product.isFeatured) {
    throw Errors.badRequest('Máximo 3 productos destacados');
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
}));

// Delete product
router.delete('/:id', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  if (product.imagePublicId) {
    await deleteImage(product.imagePublicId);
  }

  await prisma.product.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Producto eliminado' });
}));

// Bulk create products with images
router.post('/bulk-create-with-images', authenticate, requirePulperia, uploadProduct.array('images'), asyncHandler(async (req, res) => {
  // Reconstruct products array from indexed fields (products[0][name], products[0][price], etc.)
  const products = [];
  let i = 0;
  while (req.body[`products[${i}][name]`] !== undefined) {
    products.push({
      name: req.body[`products[${i}][name]`],
      price: req.body[`products[${i}][price]`],
      description: req.body[`products[${i}][description]`] || '',
      category: req.body[`products[${i}][category]`] || null,
    });
    i++;
  }

  if (products.length === 0) {
    throw Errors.badRequest('Se requiere al menos un producto');
  }

  if (!req.files || req.files.length === 0) {
    throw Errors.badRequest('Se requieren imágenes');
  }

  if (req.files.length !== products.length) {
    throw Errors.badRequest(`Cantidad de imágenes (${req.files.length}) no coincide con productos (${products.length})`);
  }

  const createdProducts = [];
  const errors = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const file = req.files[i];

    if (!product.name || product.name.trim().length === 0) {
      errors.push({ index: i, message: 'Nombre requerido' });
      continue;
    }

    const parsedPrice = parseFloat(product.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push({ index: i, message: 'Precio inválido' });
      continue;
    }

    try {
      const created = await prisma.product.create({
        data: {
          pulperiaId: req.user.pulperia.id,
          name: product.name.trim(),
          description: product.description?.trim() || '',
          price: parsedPrice,
          category: product.category || null,
          imageUrl: file.path,
          imagePublicId: file.filename,
        },
      });

      createdProducts.push({
        id: created.id,
        name: created.name,
        imageUrl: created.imageUrl,
      });
    } catch (err) {
      console.error(`Error creating product ${i}:`, err);
      errors.push({ index: i, message: 'Error al crear producto' });
      if (file.filename) {
        await deleteImage(file.filename).catch(() => {});
      }
    }
  }

  res.status(201).json({
    created: createdProducts.length,
    products: createdProducts,
    errors,
  });
}));

// Create product alert (avisame cuando llegue)
router.post('/:id/alert', authenticate, asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!product) {
    throw Errors.notFound('Producto');
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
}));

export default router;
