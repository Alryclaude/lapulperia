import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';
import { sendPushNotification } from '../services/firebase.js';
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

    // Validar que todas las cantidades sean números enteros positivos
    const invalidItems = items.filter(item =>
      !item.quantity ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      return res.status(400).json({ error: { message: 'Las cantidades deben ser números enteros positivos' } });
    }

    // Verify pulperia exists and is open
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: pulperiaId },
    });

    if (!pulperia) {
      return res.status(404).json({ error: { message: 'Pulpería no encontrada' } });
    }
    if (pulperia.isPermanentlyClosed) {
      return res.status(410).json({ error: { message: 'Pulpería cerrada permanentemente' } });
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

    // Send push notification to pulperia owner
    const pulperiaOwner = await prisma.user.findUnique({
      where: { id: pulperia.userId },
      select: { fcmToken: true },
    });

    // Log de diagnóstico para notificaciones
    console.log(`[NOTIF] Order ${order.orderNumber} - User ${pulperia.userId} fcmToken: ${pulperiaOwner?.fcmToken ? 'EXISTS' : 'NULL'}`);

    if (pulperiaOwner?.fcmToken) {
      try {
        console.log(`[NOTIF] Sending push to user ${pulperia.userId}...`);
        // Crear resumen creativo de productos
        const productSummary = orderItems.slice(0, 2).map(i => i.productName).join(', ');
        const extra = orderItems.length > 2 ? ` +${orderItems.length - 2} más` : '';
        const notifBody = `${req.user.name}: ${productSummary}${extra} • L.${total.toFixed(2)}`;

        await sendPushNotification(
          pulperiaOwner.fcmToken,
          '🛒 ¡Nueva orden recibida!',
          notifBody,
          {
            type: 'new_order',
            orderId: order.id,
            isPulperia: 'true',
          }
        );
        console.log(`[NOTIF] Push sent successfully to user ${pulperia.userId}`);
      } catch (pushError) {
        console.error(`[NOTIF] Push failed for user ${pulperia.userId}:`, pushError.message);
      }
    } else {
      console.log(`[NOTIF] Skipped - no fcmToken for user ${pulperia.userId}`);
    }

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

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: { message: 'Se requiere al menos un pedido' } });
    }

    // Validar todas las cantidades en todos los pedidos
    for (const orderData of orders) {
      const invalidItems = (orderData.items || []).filter(item =>
        !item.quantity ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      );
      if (invalidItems.length > 0) {
        return res.status(400).json({ error: { message: 'Las cantidades deben ser números enteros positivos' } });
      }
    }

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

      // Send push notification to pulperia owner
      const pulperiaOwner = await prisma.user.findUnique({
        where: { id: pulperia.userId },
        select: { fcmToken: true },
      });

      // Log de diagnóstico para notificaciones (batch)
      console.log(`[NOTIF-BATCH] Order ${order.orderNumber} - User ${pulperia.userId} fcmToken: ${pulperiaOwner?.fcmToken ? 'EXISTS' : 'NULL'}`);

      if (pulperiaOwner?.fcmToken) {
        try {
          console.log(`[NOTIF-BATCH] Sending push to user ${pulperia.userId}...`);
          // Crear resumen creativo de productos
          const productSummary = orderItems.slice(0, 2).map(i => i.productName).join(', ');
          const extra = orderItems.length > 2 ? ` +${orderItems.length - 2} más` : '';
          const notifBody = `${req.user.name}: ${productSummary}${extra} • L.${total.toFixed(2)}`;

          await sendPushNotification(
            pulperiaOwner.fcmToken,
            '🛒 ¡Nueva orden recibida!',
            notifBody,
            {
              type: 'new_order',
              orderId: order.id,
              isPulperia: 'true',
            }
          );
          console.log(`[NOTIF-BATCH] Push sent successfully to user ${pulperia.userId}`);
        } catch (pushError) {
          console.error(`[NOTIF-BATCH] Push failed for user ${pulperia.userId}:`, pushError.message);
        }
      } else {
        console.log(`[NOTIF-BATCH] Skipped - no fcmToken for user ${pulperia.userId}`);
      }
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

    let updatedOrder;

    // Use transaction for DELIVERED status to ensure all updates succeed or fail together
    if (status === 'DELIVERED') {
      updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order status
        const updated = await tx.order.update({
          where: { id: req.params.id },
          data: { status, deliveredAt: new Date() },
          include: { items: true },
        });

        // Update pulperia stats
        await tx.pulperia.update({
          where: { id: req.user.pulperia.id },
          data: {
            totalOrders: { increment: 1 },
            totalSales: { increment: 1 },
          },
        });

        // Add loyalty points if program exists
        const loyaltyProgram = await tx.loyaltyProgram.findUnique({
          where: { pulperiaId: req.user.pulperia.id },
        });

        if (loyaltyProgram && loyaltyProgram.isActive) {
          await tx.loyaltyPoint.upsert({
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

        return updated;
      });

      // Check achievements outside transaction (non-critical)
      checkAchievements(req.user.pulperia.id).catch(() => {});
    } else {
      // For other statuses, simple update
      const updateData = { status };

      switch (status) {
        case 'ACCEPTED':
          updateData.acceptedAt = new Date();
          break;
        case 'READY':
          updateData.readyAt = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          updateData.cancelReason = cancelReason;
          break;
      }

      updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: updateData,
        include: { items: true },
      });
    }

    // Notify customer via socket
    const io = req.app.get('io');
    io.to(order.userId).emit('order-updated', {
      order: updatedOrder,
      message: getStatusMessage(status),
    });

    // Send push notification to customer
    const customer = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { fcmToken: true },
    });

    if (customer?.fcmToken) {
      await sendPushNotification(
        customer.fcmToken,
        getPushTitle(status),
        getStatusMessage(status),
        {
          type: 'order_update',
          orderId: order.id,
          status,
          isPulperia: 'false',
        }
      );
    }

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

function getPushTitle(status) {
  const titles = {
    ACCEPTED: '¡Pedido Aceptado!',
    PREPARING: 'Preparando tu pedido',
    READY: '¡Pedido Listo!',
    DELIVERED: '¡Entregado!',
    CANCELLED: 'Pedido Cancelado',
  };
  return titles[status] || 'La Pulpería';
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

    // Check streak (7 days of consecutive deliveries)
    if (!existingTypes.includes('STREAK_7')) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6); // Incluye hoy
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Obtener entregas de los últimos 7 días
      const recentDeliveries = await prisma.order.findMany({
        where: {
          pulperiaId,
          status: 'DELIVERED',
          deliveredAt: { gte: sevenDaysAgo },
        },
        select: { deliveredAt: true },
      });

      // Crear set de fechas con entregas (formato YYYY-MM-DD)
      const deliveryDates = new Set(
        recentDeliveries
          .filter(o => o.deliveredAt)
          .map(o => o.deliveredAt.toISOString().split('T')[0])
      );

      // Verificar si hay entregas en los 7 días consecutivos
      let consecutiveDays = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (deliveryDates.has(dateStr)) {
          consecutiveDays++;
        } else {
          break; // Streak roto
        }
      }

      // Desbloquear achievement si tiene 7 días consecutivos
      if (consecutiveDays >= 7) {
        await prisma.achievement.create({
          data: { pulperiaId, type: 'STREAK_7' },
        });
      }
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
}

export default router;
