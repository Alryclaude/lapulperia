import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Get my shipping methods (pulperia)
router.get('/methods', authenticate, requirePulperia, async (req, res) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { pulperiaId: req.user.pulperia.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ methods });
  } catch (error) {
    console.error('Get shipping methods error:', error);
    res.status(500).json({ error: { message: 'Error al obtener métodos de envío' } });
  }
});

// Get shipping methods for a pulperia (public)
router.get('/pulperia/:pulperiaId', async (req, res) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: {
        pulperiaId: req.params.pulperiaId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        coverageArea: true,
        estimatedDays: true,
        baseCost: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ methods });
  } catch (error) {
    console.error('Get pulperia shipping methods error:', error);
    res.status(500).json({ error: { message: 'Error al obtener métodos de envío' } });
  }
});

// Add shipping method
router.post('/methods', authenticate, requirePulperia, async (req, res) => {
  try {
    const { name, coverageArea, estimatedDays, baseCost } = req.body;

    if (!name) {
      return res.status(400).json({
        error: { message: 'Nombre del método es requerido' }
      });
    }

    const method = await prisma.shippingMethod.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        name,
        coverageArea,
        estimatedDays,
        baseCost,
      },
    });

    res.status(201).json({ method });
  } catch (error) {
    console.error('Add shipping method error:', error);
    res.status(500).json({ error: { message: 'Error al agregar método de envío' } });
  }
});

// Update shipping method
router.patch('/methods/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const { name, coverageArea, estimatedDays, baseCost, isActive } = req.body;

    // Verificar que el método pertenece a la pulpería
    const existing = await prisma.shippingMethod.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Método de envío no encontrado' } });
    }

    const method = await prisma.shippingMethod.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(coverageArea !== undefined && { coverageArea }),
        ...(estimatedDays !== undefined && { estimatedDays }),
        ...(baseCost !== undefined && { baseCost }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ method });
  } catch (error) {
    console.error('Update shipping method error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar método de envío' } });
  }
});

// Delete shipping method
router.delete('/methods/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    // Verificar que el método pertenece a la pulpería
    const existing = await prisma.shippingMethod.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Método de envío no encontrado' } });
    }

    await prisma.shippingMethod.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Método de envío eliminado' });
  } catch (error) {
    console.error('Delete shipping method error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar método de envío' } });
  }
});

export default router;
