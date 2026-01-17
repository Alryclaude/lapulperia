import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Información de proveedores de pago
const PAYMENT_PROVIDERS = {
  BAC: { name: 'BAC Credomatic', icon: 'bank', type: 'bank' },
  BANPAIS: { name: 'Banpaís', icon: 'bank', type: 'bank' },
  FICOHSA: { name: 'Ficohsa', icon: 'bank', type: 'bank' },
  ATLANTIDA: { name: 'Banco Atlántida', icon: 'bank', type: 'bank' },
  DAVIVIENDA: { name: 'Davivienda', icon: 'bank', type: 'bank' },
  OCCIDENTE: { name: 'Banco de Occidente', icon: 'bank', type: 'bank' },
  BANRURAL: { name: 'Banrural', icon: 'bank', type: 'bank' },
  LAFISE: { name: 'Banco LAFISE', icon: 'bank', type: 'bank' },
  TIGO_MONEY: { name: 'Tigo Money', icon: 'wallet', type: 'wallet' },
  TENGO: { name: 'Tengo', icon: 'wallet', type: 'wallet' },
  CASH: { name: 'Efectivo', icon: 'cash', type: 'cash' },
  OTHER: { name: 'Otro', icon: 'other', type: 'other' },
};

// Get payment providers list
router.get('/providers', (req, res) => {
  res.json({ providers: PAYMENT_PROVIDERS });
});

// Get my payment methods (pulperia)
router.get('/methods', authenticate, requirePulperia, async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { pulperiaId: req.user.pulperia.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ methods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: { message: 'Error al obtener métodos de pago' } });
  }
});

// Get payment methods for a pulperia (public)
router.get('/pulperia/:pulperiaId', async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: {
        pulperiaId: req.params.pulperiaId,
        isActive: true,
      },
      select: {
        id: true,
        provider: true,
        accountName: true,
        accountNumber: true,
        instructions: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Enriquecer con información del proveedor
    const enrichedMethods = methods.map(m => ({
      ...m,
      providerInfo: PAYMENT_PROVIDERS[m.provider] || PAYMENT_PROVIDERS.OTHER,
    }));

    res.json({ methods: enrichedMethods });
  } catch (error) {
    console.error('Get pulperia payment methods error:', error);
    res.status(500).json({ error: { message: 'Error al obtener métodos de pago' } });
  }
});

// Add payment method
router.post('/methods', authenticate, requirePulperia, async (req, res) => {
  try {
    const { provider, accountName, accountNumber, instructions } = req.body;

    if (!provider || !accountName || !accountNumber) {
      return res.status(400).json({
        error: { message: 'Proveedor, nombre y número de cuenta son requeridos' }
      });
    }

    // Validar que el proveedor existe
    if (!PAYMENT_PROVIDERS[provider]) {
      return res.status(400).json({
        error: { message: 'Proveedor de pago inválido' }
      });
    }

    const method = await prisma.paymentMethod.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        provider,
        accountName,
        accountNumber,
        instructions,
      },
    });

    res.status(201).json({ method });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: { message: 'Error al agregar método de pago' } });
  }
});

// Update payment method
router.patch('/methods/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const { accountName, accountNumber, instructions, isActive } = req.body;

    // Verificar que el método pertenece a la pulpería
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Método de pago no encontrado' } });
    }

    const method = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: {
        ...(accountName && { accountName }),
        ...(accountNumber && { accountNumber }),
        ...(instructions !== undefined && { instructions }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ method });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar método de pago' } });
  }
});

// Delete payment method
router.delete('/methods/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    // Verificar que el método pertenece a la pulpería
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Método de pago no encontrado' } });
    }

    await prisma.paymentMethod.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar método de pago' } });
  }
});

export default router;
