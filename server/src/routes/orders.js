import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Errors } from '../middleware/errorHandler.js';
import { sendPushNotification } from '../services/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get user's orders
router.get('/my-orders', authenticate, asyncHandler(async (req, res) => {
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
}));

// Get pulperia's orders
router.get('/pulperia-orders', authenticate, requirePulperia, asyncHandler(async (req, res) => {
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
}));

// Create order
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { pulperiaId, items, notes } = req.body;

  if (!items || items.length === 0) {
    throw Errors.badRequest('Se requieren productos');
  }

  // Validar que todas las cantidades sean números enteros positivos
  const invalidItems = items.filter(item =>
    !item.quantity ||
    !Number.isInteger(item.quantity) ||
    item.quantity <= 0
  );
  if (invalidItems.length > 0) {
    throw Errors.badRequest('Las cantidades deben ser números enteros positivos');
  }

  // Verify pulperia exists and is open
  const pulperia = await prisma.pulperia.findUnique({
    where: { id: pulperiaId },
  });

  if (!pulperia) {
    throw Errors.notFound('Pulpería');
  }
  if (pulperia.isPermanentlyClosed) {
    throw Errors.gone('Pulpería cerrada permanentemente');
  }

  // Get product details and calculate total
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, pulperiaId },
  });

  if (products.length !== items.length) {
    throw Errors.badRequest('Algunos productos no están disponibles');
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

  // Send push notification to pulperia owner (non-blocking)
  sendOrderNotification(pulperia.userId, order, orderItems, total, req.user.name);

  res.status(201).json({ order });
}));

// Helper function for push notifications (non-blocking)
async function sendOrderNotification(pulperiaUserId, order, orderItems, total, customerName) {
  try {
    const pulperiaOwner = await prisma.user.findUnique({
      where: { id: pulperiaUserId },
      select: { fcmToken: true },
    });

    if (!pulperiaOwner?.fcmToken) {
      console.log(`[NOTIF] Skipped - no fcmToken for user ${pulperiaUserId}`);
      return;
    }

    const productSummary = orderItems.slice(0, 2).map(i => i.productName).join(', ');
    const extra = orderItems.length > 2 ? ` +${orderItems.length - 2} más` : '';
    const notifBody = `${customerName}: ${productSummary}${extra} • L.${total.toFixed(2)}`;

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
    console.log(`[NOTIF] Push sent successfully to user ${pulperiaUserId}`);
  } catch (pushError) {
    console.error(`[NOTIF] Push failed for user ${pulperiaUserId}:`, pushError.message);
  }
}

// Create multiple orders (from cart with multiple pulperias)
router.post('/batch', authenticate, asyncHandler(async (req, res) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    throw Errors.badRequest('Se requiere al menos un pedido');
  }

  // Validar todas las cantidades en todos los pedidos
  for (const orderData of orders) {
    const invalidItems = (orderData.items || []).filter(item =>
      !item.quantity ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      throw Errors.badRequest('Las cantidades deben ser números enteros positivos');
    }
  }

  const createdOrders = [];
  const io = req.app.get('io');

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
    io.to(pulperia.userId).emit('new-order', {
      order,
      message: '¡Nueva orden recibida!',
    });

    // Send push notification (non-blocking, reusing helper)
    sendOrderNotification(pulperia.userId, order, orderItems, total, req.user.name);
  }

  res.status(201).json({ orders: createdOrders });
}));

// Update order status (pulperia only)
router.patch('/:id/status', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    include: { user: true },
  });

  if (!order) {
    throw Errors.notFound('Pedido');
  }

  let updatedOrder;

  // Use transaction for DELIVERED status to ensure all updates succeed or fail together
  if (status === 'DELIVERED') {
    updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { status, deliveredAt: new Date() },
        include: { items: true },
      });

      await tx.pulperia.update({
        where: { id: req.user.pulperia.id },
        data: {
          totalOrders: { increment: 1 },
          totalSales: { increment: 1 },
        },
      });

      return updated;
    });

    // Check achievements outside transaction (non-critical)
    checkAchievements(req.user.pulperia.id).catch(() => {});
  } else {
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

  // Send push notification to customer (non-blocking)
  sendStatusNotification(order.userId, order.id, status);

  res.json({ order: updatedOrder });
}));

// Helper for status change notifications
async function sendStatusNotification(userId, orderId, status) {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (customer?.fcmToken) {
      await sendPushNotification(
        customer.fcmToken,
        getPushTitle(status),
        getStatusMessage(status),
        {
          type: 'order_update',
          orderId,
          status,
          isPulperia: 'false',
        }
      );
    }
  } catch (error) {
    console.error(`[NOTIF] Status notification failed:`, error.message);
  }
}

// Get single order
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
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
    throw Errors.notFound('Pedido');
  }

  res.json({ order });
}));

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

// ═══════════════════════════════════════════════════════════════
// VENTA RÁPIDA (Sin productos - modo calculadora)
// ═══════════════════════════════════════════════════════════════

router.post('/quick-sale', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    throw Errors.badRequest('El monto debe ser mayor a 0');
  }

  const pulperiaId = req.user.pulperia.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `QS-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: req.user.id,
      pulperiaId,
      total: parseFloat(amount),
      notes: description || 'Venta rápida',
      status: 'DELIVERED',
      deliveredAt: new Date(),
      isQuickSale: true,
    }
  });

  await prisma.dailyStat.upsert({
    where: { pulperiaId_date: { pulperiaId, date: today } },
    update: {
      totalSales: { increment: parseFloat(amount) },
      totalOrders: { increment: 1 }
    },
    create: {
      pulperiaId,
      date: today,
      totalSales: parseFloat(amount),
      totalOrders: 1
    }
  });

  await prisma.pulperia.update({
    where: { id: pulperiaId },
    data: {
      totalOrders: { increment: 1 },
      totalSales: { increment: 1 }
    }
  });

  res.status(201).json({
    success: true,
    order,
    message: `Venta de L ${amount.toFixed(2)} registrada`
  });
}));

// Obtener ventas rápidas del día
router.get('/quick-sales/today', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const pulperiaId = req.user.pulperia.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const quickSales = await prisma.order.findMany({
    where: {
      pulperiaId,
      isQuickSale: true,
      createdAt: { gte: today, lt: tomorrow }
    },
    orderBy: { createdAt: 'desc' }
  });

  const total = quickSales.reduce((sum, sale) => sum + sale.total, 0);

  res.json({ sales: quickSales, total, count: quickSales.length });
}));

// Eliminar venta rápida (solo del día actual)
router.delete('/quick-sale/:id', authenticate, requirePulperia, asyncHandler(async (req, res) => {
  const pulperiaId = req.user.pulperia.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      pulperiaId,
      isQuickSale: true,
      createdAt: { gte: today }
    }
  });

  if (!order) {
    throw Errors.notFound('Venta no encontrada o no puede ser eliminada');
  }

  await prisma.dailyStat.update({
    where: { pulperiaId_date: { pulperiaId, date: today } },
    data: {
      totalSales: { decrement: order.total },
      totalOrders: { decrement: 1 }
    }
  });

  await prisma.pulperia.update({
    where: { id: pulperiaId },
    data: {
      totalOrders: { decrement: 1 },
      totalSales: { decrement: 1 }
    }
  });

  await prisma.order.delete({ where: { id: req.params.id } });

  res.json({ success: true });
}));

export default router;
