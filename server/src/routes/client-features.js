import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// =====================
// PRODUCT FAVORITES
// =====================

// Get my favorite products
router.get('/favorites/products', authenticate, async (req, res) => {
  try {
    const favorites = await prisma.productFavorite.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            pulperia: {
              select: { id: true, name: true, logo: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = favorites
      .filter(f => f.product && f.product.isAvailable)
      .map(f => ({
        ...f.product,
        isFavorite: true,
      }));

    res.json({ products });
  } catch (error) {
    console.error('Get favorite products error:', error);
    res.status(500).json({ error: { message: 'Error al obtener productos favoritos' } });
  }
});

// Toggle product favorite
router.post('/favorites/products/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    // Buscar si ya está en favoritos
    const existing = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existing) {
      // Eliminar de favoritos
      await prisma.productFavorite.delete({
        where: { id: existing.id },
      });
      return res.json({ isFavorite: false });
    }

    // Agregar a favoritos
    await prisma.productFavorite.create({
      data: {
        userId: req.user.id,
        productId,
      },
    });

    res.json({ isFavorite: true });
  } catch (error) {
    console.error('Toggle product favorite error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar favorito' } });
  }
});

// Check if product is favorite
router.get('/favorites/products/:productId/check', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const favorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check product favorite error:', error);
    res.status(500).json({ error: { message: 'Error al verificar favorito' } });
  }
});

// =====================
// REORDER
// =====================

// Get reorder data for an order
router.get('/reorder/:orderId', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.orderId,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        pulperia: {
          select: { id: true, name: true, status: true, logo: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: { message: 'Orden no encontrada' } });
    }

    // Verificar disponibilidad de productos
    const reorderItems = order.items.map(item => {
      const isAvailable = item.product && item.product.isAvailable && !item.product.outOfStock;
      const priceChanged = item.product && item.product.price !== item.priceAtTime;

      return {
        productId: item.productId,
        productName: item.productName || item.product?.name,
        productImage: item.productImage || item.product?.imageUrl,
        quantity: item.quantity,
        originalPrice: item.priceAtTime,
        currentPrice: item.product?.price || item.priceAtTime,
        isAvailable,
        priceChanged,
        priceIncrease: priceChanged ? (item.product?.price || 0) - item.priceAtTime : 0,
      };
    });

    const allAvailable = reorderItems.every(item => item.isAvailable);
    const hasPriceChanges = reorderItems.some(item => item.priceChanged);

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        total: order.total,
      },
      pulperia: order.pulperia,
      items: reorderItems,
      allAvailable,
      hasPriceChanges,
      newTotal: reorderItems.reduce((sum, item) =>
        sum + (item.isAvailable ? item.currentPrice * item.quantity : 0), 0),
    });
  } catch (error) {
    console.error('Get reorder data error:', error);
    res.status(500).json({ error: { message: 'Error al obtener datos de reorden' } });
  }
});

// =====================
// SHOPPING LISTS
// =====================

// Get my shopping lists
router.get('/shopping-lists', authenticate, async (req, res) => {
  try {
    const lists = await prisma.shoppingList.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ lists });
  } catch (error) {
    console.error('Get shopping lists error:', error);
    res.status(500).json({ error: { message: 'Error al obtener listas de compras' } });
  }
});

// Create shopping list
router.post('/shopping-lists', authenticate, async (req, res) => {
  try {
    const { name, items = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: { message: 'Nombre de lista requerido' } });
    }

    const list = await prisma.shoppingList.create({
      data: {
        userId: req.user.id,
        name,
        items,
      },
    });

    res.status(201).json({ list });
  } catch (error) {
    console.error('Create shopping list error:', error);
    res.status(500).json({ error: { message: 'Error al crear lista de compras' } });
  }
});

// Update shopping list
router.patch('/shopping-lists/:id', authenticate, async (req, res) => {
  try {
    const { name, items } = req.body;

    const existing = await prisma.shoppingList.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Lista no encontrada' } });
    }

    const list = await prisma.shoppingList.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(items !== undefined && { items }),
      },
    });

    res.json({ list });
  } catch (error) {
    console.error('Update shopping list error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar lista' } });
  }
});

// Delete shopping list
router.delete('/shopping-lists/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.shoppingList.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Lista no encontrada' } });
    }

    await prisma.shoppingList.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    console.error('Delete shopping list error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar lista' } });
  }
});

// =====================
// PRODUCT ALERTS ("Avísame cuando llegue")
// =====================

// Get my product alerts
router.get('/alerts', authenticate, async (req, res) => {
  try {
    const alerts = await prisma.productAlert.findMany({
      where: {
        userId: req.user.id,
        notified: false,
      },
      include: {
        product: {
          include: {
            pulperia: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ alerts });
  } catch (error) {
    console.error('Get product alerts error:', error);
    res.status(500).json({ error: { message: 'Error al obtener alertas' } });
  }
});

// Create product alert
router.post('/alerts/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: { message: 'Producto no encontrado' } });
    }

    // Buscar si ya tiene alerta
    const existing = await prisma.productAlert.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return res.json({ hasAlert: true, message: 'Ya tienes una alerta para este producto' });
    }

    await prisma.productAlert.create({
      data: {
        userId: req.user.id,
        productId,
      },
    });

    res.status(201).json({ hasAlert: true, message: 'Te avisaremos cuando llegue' });
  } catch (error) {
    console.error('Create product alert error:', error);
    res.status(500).json({ error: { message: 'Error al crear alerta' } });
  }
});

// Delete product alert
router.delete('/alerts/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.productAlert.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Alerta no encontrada' } });
    }

    await prisma.productAlert.delete({
      where: { id: existing.id },
    });

    res.json({ hasAlert: false });
  } catch (error) {
    console.error('Delete product alert error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar alerta' } });
  }
});

export default router;
