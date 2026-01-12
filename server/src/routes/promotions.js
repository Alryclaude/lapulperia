import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Get my promotions (pulperia owner)
router.get('/my-promotions', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      pulperiaId: req.user.pulperia.id,
    };

    const now = new Date();

    if (status === 'active') {
      where.isActive = true;
      where.startDate = { lte: now };
      where.OR = [
        { endDate: null },
        { endDate: { gte: now } },
      ];
    } else if (status === 'scheduled') {
      where.isActive = true;
      where.startDate = { gt: now };
    } else if (status === 'ended') {
      where.OR = [
        { isActive: false },
        { endDate: { lt: now } },
      ];
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ promotions });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: { message: 'Error al obtener promociones' } });
  }
});

// Get active promotions for a pulperia (public)
router.get('/pulperia/:pulperiaId', optionalAuth, async (req, res) => {
  try {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        pulperiaId: req.params.pulperiaId,
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ promotions });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: { message: 'Error al obtener promociones' } });
  }
});

// Get single promotion
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!promotion) {
      return res.status(404).json({ error: { message: 'Promocion no encontrada' } });
    }

    res.json({ promotion });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({ error: { message: 'Error al obtener promocion' } });
  }
});

// Create promotion
router.post('/', authenticate, requirePulperia, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      productIds,
      categoryIds,
      startDate,
      endDate,
      maxUsage,
    } = req.body;

    // Validation
    if (!name || !type || value === undefined || !startDate) {
      return res.status(400).json({
        error: { message: 'Nombre, tipo, valor y fecha de inicio son requeridos' },
      });
    }

    const validTypes = ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'COMBO'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: { message: 'Tipo de promocion invalido' },
      });
    }

    const promotion = await prisma.promotion.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        name,
        description,
        type,
        value: parseFloat(value),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        productIds: productIds || [],
        categoryIds: categoryIds || [],
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
      },
    });

    res.status(201).json({ promotion });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: { message: 'Error al crear promocion' } });
  }
});

// Update promotion
router.patch('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!promotion) {
      return res.status(404).json({ error: { message: 'Promocion no encontrada' } });
    }

    const {
      name,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      productIds,
      categoryIds,
      startDate,
      endDate,
      isActive,
      maxUsage,
    } = req.body;

    const updatedPromotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minPurchase !== undefined && { minPurchase: minPurchase ? parseFloat(minPurchase) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(productIds !== undefined && { productIds }),
        ...(categoryIds !== undefined && { categoryIds }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(maxUsage !== undefined && { maxUsage: maxUsage ? parseInt(maxUsage) : null }),
      },
    });

    res.json({ promotion: updatedPromotion });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar promocion' } });
  }
});

// Delete promotion
router.delete('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!promotion) {
      return res.status(404).json({ error: { message: 'Promocion no encontrada' } });
    }

    await prisma.promotion.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Promocion eliminada' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar promocion' } });
  }
});

// Increment usage count (called when promotion is applied to an order)
router.post('/:id/use', authenticate, async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id },
    });

    if (!promotion) {
      return res.status(404).json({ error: { message: 'Promocion no encontrada' } });
    }

    // Check if max usage reached
    if (promotion.maxUsage && promotion.usageCount >= promotion.maxUsage) {
      return res.status(400).json({ error: { message: 'Esta promocion ha alcanzado su limite de uso' } });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        usageCount: { increment: 1 },
      },
    });

    res.json({ promotion: updatedPromotion });
  } catch (error) {
    console.error('Use promotion error:', error);
    res.status(500).json({ error: { message: 'Error al aplicar promocion' } });
  }
});

export default router;
