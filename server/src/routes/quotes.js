import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// LISTAR COTIZACIONES
// ═══════════════════════════════════════════════════════════════

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;

    // Obtener pulpería del usuario si existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    const where = {
      OR: [
        { userId: req.user.id },
        ...(user.pulperia ? [{ pulperiaId: user.pulperia.id }] : [])
      ]
    };

    if (status) where.status = status;

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { clientName: { contains: search, mode: 'insensitive' } },
            { quoteNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: { message: 'Error al cargar cotizaciones' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// DETALLE DE COTIZACIÓN
// ═══════════════════════════════════════════════════════════════

router.get('/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            whatsapp: true,
            address: true,
            userId: true
          }
        },
        user: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({ error: { message: 'Cotización no encontrada' } });
    }

    // Solo el creador o dueño de la pulpería pueden ver
    if (quote.userId !== req.user.id && quote.pulperia?.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: { message: 'Error al cargar cotización' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// CREAR COTIZACIÓN
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      clientWhatsapp,
      title,
      description,
      items,
      laborCost,
      materialsCost,
      discount,
      validUntil,
      estimatedTime,
      warranty,
      paymentTerms,
      notes
    } = req.body;

    if (!clientName || !title || !items || items.length === 0) {
      return res.status(400).json({
        error: { message: 'Cliente, título y al menos un item son requeridos' }
      });
    }

    // Obtener pulpería del usuario si existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    // Calcular totales
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.qty) * parseFloat(item.unitPrice));
    }, 0);

    const labor = parseFloat(laborCost) || 0;
    const materials = parseFloat(materialsCost) || 0;
    const subtotal = itemsTotal + labor + materials;
    const discountAmount = parseFloat(discount) || 0;
    const total = subtotal - discountAmount;

    // Generar número de cotización
    const count = await prisma.quote.count({
      where: user.pulperia
        ? { pulperiaId: user.pulperia.id }
        : { userId: req.user.id }
    });
    const prefix = user.pulperia?.name?.substring(0, 3).toUpperCase() || 'COT';
    const quoteNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        userId: req.user.id,
        pulperiaId: user.pulperia?.id || null,
        clientName,
        clientPhone,
        clientWhatsapp,
        title,
        description,
        items,
        laborCost: labor,
        materialsCost: materials,
        subtotal,
        discount: discountAmount,
        total,
        validUntil: validUntil ? new Date(validUntil) : null,
        estimatedTime,
        warranty,
        paymentTerms,
        notes
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: { message: 'Error al crear cotización' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACTUALIZAR COTIZACIÓN
// ═══════════════════════════════════════════════════════════════

router.put('/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id }
    });

    if (!quote) {
      return res.status(404).json({ error: { message: 'Cotización no encontrada' } });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    // No permitir editar cotizaciones aceptadas o completadas
    if (['ACCEPTED', 'COMPLETED'].includes(quote.status)) {
      return res.status(400).json({
        error: { message: 'No se puede editar una cotización aceptada o completada' }
      });
    }

    const {
      clientName,
      clientPhone,
      clientWhatsapp,
      title,
      description,
      items,
      laborCost,
      materialsCost,
      discount,
      validUntil,
      estimatedTime,
      warranty,
      paymentTerms,
      notes,
      status
    } = req.body;

    // Recalcular totales si hay items
    let updateData = {
      clientName,
      clientPhone,
      clientWhatsapp,
      title,
      description,
      validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
      estimatedTime,
      warranty,
      paymentTerms,
      notes,
      status
    };

    if (items) {
      const itemsTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.qty) * parseFloat(item.unitPrice));
      }, 0);

      const labor = parseFloat(laborCost) || quote.laborCost;
      const materials = parseFloat(materialsCost) || quote.materialsCost;
      const subtotal = itemsTotal + labor + materials;
      const discountAmount = parseFloat(discount) || quote.discount;
      const total = subtotal - discountAmount;

      updateData = {
        ...updateData,
        items,
        laborCost: labor,
        materialsCost: materials,
        subtotal,
        discount: discountAmount,
        total
      };
    }

    // Manejar timestamps de estado
    if (status === 'SENT' && quote.status === 'DRAFT') {
      updateData.sentAt = new Date();
    }
    if (status === 'ACCEPTED' && !quote.acceptedAt) {
      updateData.acceptedAt = new Date();
    }
    if (status === 'COMPLETED' && !quote.completedAt) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.quote.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: { message: 'Error al actualizar cotización' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ELIMINAR COTIZACIÓN
// ═══════════════════════════════════════════════════════════════

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id }
    });

    if (!quote) {
      return res.status(404).json({ error: { message: 'Cotización no encontrada' } });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    await prisma.quote.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: { message: 'Error al eliminar cotización' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// DUPLICAR COTIZACIÓN
// ═══════════════════════════════════════════════════════════════

router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const original = await prisma.quote.findUnique({
      where: { id: req.params.id }
    });

    if (!original) {
      return res.status(404).json({ error: { message: 'Cotización no encontrada' } });
    }

    if (original.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    // Generar nuevo número
    const count = await prisma.quote.count({
      where: original.pulperiaId
        ? { pulperiaId: original.pulperiaId }
        : { userId: req.user.id }
    });
    const prefix = original.quoteNumber.split('-')[0];
    const quoteNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;

    const newQuote = await prisma.quote.create({
      data: {
        quoteNumber,
        userId: original.userId,
        pulperiaId: original.pulperiaId,
        clientName: original.clientName,
        clientPhone: original.clientPhone,
        clientWhatsapp: original.clientWhatsapp,
        title: `${original.title} (copia)`,
        description: original.description,
        items: original.items,
        laborCost: original.laborCost,
        materialsCost: original.materialsCost,
        subtotal: original.subtotal,
        discount: original.discount,
        total: original.total,
        estimatedTime: original.estimatedTime,
        warranty: original.warranty,
        paymentTerms: original.paymentTerms,
        notes: original.notes,
        status: 'DRAFT'
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Error duplicating quote:', error);
    res.status(500).json({ error: { message: 'Error al duplicar cotización' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS DE COTIZACIONES
// ═══════════════════════════════════════════════════════════════

router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    const whereBase = user.pulperia
      ? { pulperiaId: user.pulperia.id }
      : { userId: req.user.id };

    const [total, draft, sent, accepted, completed, totalValue] = await Promise.all([
      prisma.quote.count({ where: whereBase }),
      prisma.quote.count({ where: { ...whereBase, status: 'DRAFT' } }),
      prisma.quote.count({ where: { ...whereBase, status: 'SENT' } }),
      prisma.quote.count({ where: { ...whereBase, status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { ...whereBase, status: 'COMPLETED' } }),
      prisma.quote.aggregate({
        where: { ...whereBase, status: { in: ['ACCEPTED', 'COMPLETED'] } },
        _sum: { total: true }
      })
    ]);

    res.json({
      total,
      draft,
      sent,
      accepted,
      completed,
      conversionRate: sent > 0 ? Math.round(((accepted + completed) / sent) * 100) : 0,
      totalValue: totalValue._sum.total || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: { message: 'Error al cargar estadísticas' } });
  }
});

export default router;
