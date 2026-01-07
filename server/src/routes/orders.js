import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true, phone: true, whatsapp: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pedidos' } });
  }
});

// Get pulperia's orders
router.get('/pulperia-orders', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status, date, limit = 50, offset = 0 } = req.query;

    const where = { pulperiaId: req.user.pulperia.id };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Count by status for the dashboard
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { pulperiaId: req.user.pulperia.id },
      _count: true,
    });

    res.json({ orders, statusCounts });
  } catch (error) {
    console.error('Get pulperia orders error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pedidos' } });
  }
});

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { pulperiaId, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: { message: 'Se requieren productos' } });
    }

    // Verify pulperia exists and is open
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: pulperiaId },
    });

    if (!pulperia || pulperia.isPermanentlyClosed) {
      return res.status(400).json({ error: { message: 'Pulpería no disponible' } });
    }

    // Get product details and calculate total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, pulperiaId },
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: { message: 'Algunos productos no están disponibles' } });
    }

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: product.price,
        productName: product.name,
        productImage: product.imageUrl,
      };
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: req.user.id,
        pulperiaId,
        total,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        pulperia: {
          select: { id: true, name: true, userId: true },
        },
      },
    });

    // Emit socket event to pulperia
    const io = req.app.get('io');
    io.to(pulperia.userId).emit('new-order', {
      order,
      message: '¡Nueva orden recibida!',
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: { message: 'Error al crear pedido' } });
  }
});

// Create multiple orders (from cart with multiple pulperias)
router.post('/batch', authenticate, async (req, res) => {
  try {
    const { orders } = req.body;

    const createdOrders = [];

    for (const orderData of orders) {
      const { pulperiaId, items, notes } = orderData;

      const pulperia = await prisma.pulperia.findUnique({
        where: { id: pulperiaId },
      });

      if (!pulperia || pulperia.isPermanentlyClosed) continue;

      const productIds = items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, pulperiaId },
      });

      let total = 0;
      const orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        return {
          productId: product.id,
          quantity: item.quantity,
          priceAtTime: product.price,
          productName: product.name,
          productImage: product.imageUrl,
        };
      }).filter(Boolean);

      if (orderItems.length === 0) continue;

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
          userId: req.user.id,
          pulperiaId,
          total,
          notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          pulperia: {
            select: { id: true, name: true, userId: true },
          },
        },
      });

      createdOrders.push(order);

      // Emit socket event
      const io = req.app.get('io');
      io.to(pulperia.userId).emit('new-order', {
        order,
        message: '¡Nueva orden recibida!',
      });
    }

    res.status(201).json({ orders: createdOrders });
  } catch (error) {
    console.error('Create batch orders error:', error);
    res.status(500).json({ error: { message: 'Error al crear pedidos' } });
  }
});

// Update order status (pulperia only)
router.patch('/:id/status', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: { message: 'Pedido no encontrado' } });
    }

    const updateData = { status };

    switch (status) {
      case 'ACCEPTED':
        updateData.acceptedAt = new Date();
        break;
      case 'READY':
        updateData.readyAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        // Update pulperia stats
        await prisma.pulperia.update({
          where: { id: req.user.pulperia.id },
          data: {
            totalOrders: { increment: 1 },
            totalSales: { increment: 1 },
          },
        });
        // Add loyalty points
        const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
          where: { pulperiaId: req.user.pulperia.id },
        });
        if (loyaltyProgram && loyaltyProgram.isActive) {
          await prisma.loyaltyPoint.upsert({
            where: {
              loyaltyProgramId_userId: {
                loyaltyProgramId: loyaltyProgram.id,
                userId: order.userId,
              },
            },
            update: {
              points: { increment: loyaltyProgram.pointsPerPurchase },
            },
            create: {
              loyaltyProgramId: loyaltyProgram.id,
              userId: order.userId,
              points: loyaltyProgram.pointsPerPurchase,
            },
          });
        }
        // Check for achievements
        await checkAchievements(req.user.pulperia.id);
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        updateData.cancelReason = cancelReason;
        break;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { items: true },
    });

    // Notify customer
    const io = req.app.get('io');
    io.to(order.userId).emit('order-updated', {
      order: updatedOrder,
      message: getStatusMessage(status),
    });

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar pedido' } });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { pulperiaId: req.user.pulperia?.id },
        ],
      },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        pulperia: {
          select: { id: true, name: true, logo: true, phone: true, whatsapp: true, address: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: { message: 'Pedido no encontrado' } });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: { message: 'Error al obtener pedido' } });
  }
});

// Helper functions
function getStatusMessage(status) {
  const messages = {
    ACCEPTED: '¡Tu pedido fue aceptado! Lo estamos preparando.',
    PREPARING: 'Tu pedido está siendo preparado.',
    READY: '¡Tu pedido está listo para recoger!',
    DELIVERED: '¡Pedido entregado! Gracias por tu compra.',
    CANCELLED: 'Tu pedido fue cancelado.',
  };
  return messages[status] || 'Estado del pedido actualizado';
}

async function checkAchievements(pulperiaId) {
  try {
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: pulperiaId },
      include: { achievements: true },
    });

    const existingTypes = pulperia.achievements.map((a) => a.type);

    // First sale
    if (!existingTypes.includes('FIRST_SALE') && pulperia.totalOrders >= 1) {
      await prisma.achievement.create({
        data: { pulperiaId, type: 'FIRST_SALE' },
      });
    }

    // 100 customers
    if (!existingTypes.includes('HUNDRED_CUSTOMERS') && pulperia.totalOrders >= 100) {
      await prisma.achievement.create({
        data: { pulperiaId, type: 'HUNDRED_CUSTOMERS' },
      });
    }

    // Check streak (7 days)
    // TODO: Implement streak tracking
  } catch (error) {
    console.error('Check achievements error:', error);
  }
}

export default router;
