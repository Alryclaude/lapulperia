import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Función para escapar valores CSV y prevenir inyección de fórmulas
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  // Prevenir formula injection (=, +, -, @, tab, carriage return)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  // Escapar si contiene comma, quote, o newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Get dashboard stats for pulperia
router.get('/dashboard', authenticate, requirePulperia, async (req, res) => {
  try {
    const pulperiaId = req.user.pulperia.id;
    const now = new Date();

    // Today's start
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // This week start (Monday) - handles Sunday correctly
    const weekStart = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    // This month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        pulperiaId,
        createdAt: { gte: todayStart },
      },
    });

    const todayStats = {
      orders: todayOrders.length,
      delivered: todayOrders.filter((o) => o.status === 'DELIVERED').length,
      revenue: todayOrders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.total, 0),
      pending: todayOrders.filter((o) => o.status === 'PENDING').length,
    };

    // Week stats
    const weekOrders = await prisma.order.findMany({
      where: {
        pulperiaId,
        createdAt: { gte: weekStart },
        status: 'DELIVERED',
      },
    });

    const weekStats = {
      orders: weekOrders.length,
      revenue: weekOrders.reduce((sum, o) => sum + o.total, 0),
    };

    // Month stats
    const monthOrders = await prisma.order.findMany({
      where: {
        pulperiaId,
        createdAt: { gte: monthStart },
        status: 'DELIVERED',
      },
    });

    const monthStats = {
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
    };

    // Top products (this month)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          pulperiaId,
          createdAt: { gte: monthStart },
          status: 'DELIVERED',
        },
      },
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      name: p.productName,
      quantity: p._sum.quantity,
      orders: p._count,
    }));

    // Peak hours (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: {
        pulperiaId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    const hourCounts = {};
    recentOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Frequent customers (optimizado: batch query en vez de N+1)
    const frequentCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        pulperiaId,
        status: 'DELIVERED',
      },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
    });

    // Batch fetch: 1 query en vez de 5 queries individuales
    const userIds = frequentCustomers.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const customersWithDetails = frequentCustomers.map(c => ({
      ...userMap.get(c.userId),
      orderCount: c._count,
    }));

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        pulperiaId,
        isAvailable: true,
        outOfStock: true,
      },
      take: 10,
    });

    // Slow moving products (no sales in 2 weeks)
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const recentSoldProductIds = await prisma.orderItem.findMany({
      where: {
        order: {
          pulperiaId,
          createdAt: { gte: twoWeeksAgo },
        },
      },
      select: { productId: true },
      distinct: ['productId'],
    });

    const slowMovingProducts = await prisma.product.findMany({
      where: {
        pulperiaId,
        isAvailable: true,
        id: { notIn: recentSoldProductIds.map((p) => p.productId) },
      },
      take: 10,
    });

    // Daily revenue for chart (last 7 days) - optimizado: 1 query en vez de 7
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Una sola query para todos los últimos 7 días
    const ordersLast7Days = await prisma.order.findMany({
      where: {
        pulperiaId,
        createdAt: { gte: sevenDaysAgo },
        status: 'DELIVERED',
      },
      select: { createdAt: true, total: true },
    });

    // Agrupar por día en JavaScript
    const dailyMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dailyMap.set(date.toISOString().split('T')[0], { revenue: 0, orders: 0 });
    }

    ordersLast7Days.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const entry = dailyMap.get(dateKey);
        entry.revenue += order.total;
        entry.orders += 1;
      }
    });

    const dailyRevenue = Array.from(dailyMap, ([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Achievements
    const achievements = await prisma.achievement.findMany({
      where: { pulperiaId },
    });

    res.json({
      today: todayStats,
      week: weekStats,
      month: monthStats,
      topProducts,
      peakHours,
      frequentCustomers: customersWithDetails,
      lowStockProducts,
      slowMovingProducts,
      dailyRevenue,
      achievements,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: { message: 'Error al obtener estadísticas' } });
  }
});

// Get prediction/insights
router.get('/insights', authenticate, requirePulperia, async (req, res) => {
  try {
    const pulperiaId = req.user.pulperia.id;
    const insights = [];

    // Day of week analysis
    const allOrders = await prisma.order.findMany({
      where: { pulperiaId, status: 'DELIVERED' },
      select: { createdAt: true, total: true },
    });

    const dayStats = {};
    allOrders.forEach((order) => {
      const day = order.createdAt.getDay();
      if (!dayStats[day]) {
        dayStats[day] = { count: 0, total: 0 };
      }
      dayStats[day].count++;
      dayStats[day].total += order.total;
    });

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const avgByDay = Object.entries(dayStats).map(([day, stats]) => ({
      day: days[parseInt(day)],
      avgOrders: Math.round(stats.count / 4), // Approximate weekly average
      avgRevenue: Math.round(stats.total / 4),
    }));

    const bestDay = avgByDay.sort((a, b) => b.avgOrders - a.avgOrders)[0];
    if (bestDay) {
      insights.push({
        type: 'BEST_DAY',
        message: `Los ${bestDay.day} vendes ${bestDay.avgOrders}x más en promedio`,
        data: avgByDay,
      });
    }

    // Upcoming events reminder (simplified)
    const now = new Date();
    const upcomingHolidays = [
      { name: 'Semana Santa', month: 3 },
      { name: 'Día de la Madre', month: 4 },
      { name: 'Fiestas Patrias', month: 8 },
      { name: 'Navidad', month: 11 },
    ];

    upcomingHolidays.forEach((holiday) => {
      if (now.getMonth() === holiday.month - 1 || now.getMonth() === holiday.month) {
        insights.push({
          type: 'UPCOMING_EVENT',
          message: `Se acerca ${holiday.name}, prepara tu inventario`,
          data: { event: holiday.name },
        });
      }
    });

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: { message: 'Error al obtener insights' } });
  }
});

// Export data
router.get('/export', authenticate, requirePulperia, async (req, res) => {
  try {
    const { format = 'json', from, to } = req.query;
    const pulperiaId = req.user.pulperia.id;

    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const orders = await prisma.order.findMany({
      where: {
        pulperiaId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      },
      include: {
        items: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = await prisma.product.findMany({
      where: { pulperiaId },
    });

    const data = {
      exportedAt: new Date().toISOString(),
      pulperia: req.user.pulperia.name,
      orders,
      products,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders
          .filter((o) => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.total, 0),
        totalProducts: products.length,
      },
    };

    if (format === 'csv') {
      // Generate CSV for orders con escape de caracteres especiales
      const csvHeader = 'Orden,Fecha,Cliente,Total,Estado\n';
      const csvRows = orders
        .map((o) =>
          [
            escapeCSV(o.orderNumber),
            escapeCSV(o.createdAt.toISOString()),
            escapeCSV(o.user.name),
            escapeCSV(`L.${o.total}`),
            escapeCSV(o.status)
          ].join(',')
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
      return res.send(csvHeader + csvRows);
    }

    res.json(data);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: { message: 'Error al exportar datos' } });
  }
});

export default router;
