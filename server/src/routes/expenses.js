import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// LISTAR GASTOS
// ═══════════════════════════════════════════════════════════════

router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const where = {
      pulperiaId: user.pulperia.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (category) where.category = category;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: { message: 'Error al cargar gastos' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// GASTOS DE HOY
// ═══════════════════════════════════════════════════════════════

router.get('/today', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expenses = await prisma.expense.findMany({
      where: {
        pulperiaId: user.pulperia.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { date: 'desc' }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      expenses,
      total,
      count: expenses.length
    });
  } catch (error) {
    console.error('Error fetching today expenses:', error);
    res.status(500).json({ error: { message: 'Error al cargar gastos de hoy' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// CREAR GASTO
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, category, description, receiptUrl, receiptPublicId, date } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        error: { message: 'Monto y categoría son requeridos' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const expense = await prisma.expense.create({
      data: {
        pulperiaId: user.pulperia.id,
        amount: parseFloat(amount),
        category,
        description,
        receiptUrl,
        receiptPublicId,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: { message: 'Error al registrar gasto' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACTUALIZAR GASTO
// ═══════════════════════════════════════════════════════════════

router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id }
    });

    if (!expense) {
      return res.status(404).json({ error: { message: 'Gasto no encontrado' } });
    }

    if (expense.pulperiaId !== user.pulperia.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const { amount, category, description, receiptUrl, receiptPublicId, date } = req.body;

    const updated = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        description,
        receiptUrl,
        receiptPublicId,
        date: date ? new Date(date) : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: { message: 'Error al actualizar gasto' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ELIMINAR GASTO
// ═══════════════════════════════════════════════════════════════

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id }
    });

    if (!expense) {
      return res.status(404).json({ error: { message: 'Gasto no encontrado' } });
    }

    if (expense.pulperiaId !== user.pulperia.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: { message: 'Error al eliminar gasto' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// RESUMEN DE GASTOS (Profit Summary)
// ═══════════════════════════════════════════════════════════════

router.get('/summary', authenticate, async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    // Calcular rango de fechas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);

    if (period === 'day') {
      // Solo hoy
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener gastos del período
    const expenses = await prisma.expense.findMany({
      where: {
        pulperiaId: user.pulperia.id,
        date: {
          gte: startDate,
          lt: tomorrow
        }
      }
    });

    // Agrupar por categoría
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Obtener ventas del mismo período
    const dailyStats = await prisma.dailyStat.findMany({
      where: {
        pulperiaId: user.pulperia.id,
        date: {
          gte: startDate,
          lt: tomorrow
        }
      }
    });

    const totalSales = dailyStats.reduce((sum, stat) => sum + stat.totalSales, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalSales - totalExpenses;

    res.json({
      period,
      startDate,
      endDate: today,
      totalSales,
      totalExpenses,
      profit,
      profitMargin: totalSales > 0 ? Math.round((profit / totalSales) * 100) : 0,
      expensesByCategory: byCategory,
      expenseCount: expenses.length
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: { message: 'Error al cargar resumen' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS DE GASTOS
// ═══════════════════════════════════════════════════════════════

router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'SUPPLIES', label: 'Insumos', icon: 'Package' },
    { value: 'TRANSPORT', label: 'Transporte', icon: 'Truck' },
    { value: 'FOOD', label: 'Comida', icon: 'UtensilsCrossed' },
    { value: 'UTILITIES', label: 'Servicios', icon: 'Lightbulb' },
    { value: 'RENT', label: 'Alquiler', icon: 'Home' },
    { value: 'SALARIES', label: 'Sueldos', icon: 'Users' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', icon: 'Wrench' },
    { value: 'MARKETING', label: 'Publicidad', icon: 'Megaphone' },
    { value: 'OTHER', label: 'Otros', icon: 'MoreHorizontal' }
  ];

  res.json(categories);
});

// ═══════════════════════════════════════════════════════════════
// REPORTE MENSUAL
// ═══════════════════════════════════════════════════════════════

router.get('/report/monthly', authenticate, async (req, res) => {
  try {
    const { year, month } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Gastos del mes
    const expenses = await prisma.expense.findMany({
      where: {
        pulperiaId: user.pulperia.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Ventas del mes
    const dailyStats = await prisma.dailyStat.findMany({
      where: {
        pulperiaId: user.pulperia.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Agrupar por día
    const dailyData = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const dateStr = date.toISOString().split('T')[0];

      const daySales = dailyStats.find(s =>
        s.date.toISOString().split('T')[0] === dateStr
      )?.totalSales || 0;

      const dayExpenses = expenses
        .filter(e => e.date.toISOString().split('T')[0] === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      dailyData.push({
        date: dateStr,
        day,
        sales: daySales,
        expenses: dayExpenses,
        profit: daySales - dayExpenses
      });
    }

    const totalSales = dailyStats.reduce((sum, s) => sum + s.totalSales, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      year: targetYear,
      month: targetMonth,
      dailyData,
      totals: {
        sales: totalSales,
        expenses: totalExpenses,
        profit: totalSales - totalExpenses,
        expenseCount: expenses.length,
        salesDays: dailyStats.length
      }
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: { message: 'Error al cargar reporte' } });
  }
});

export default router;
