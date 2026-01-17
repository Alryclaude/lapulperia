import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Get all fiado accounts for my pulperia
router.get('/accounts', authenticate, requirePulperia, async (req, res) => {
  try {
    const accounts = await prisma.fiadoAccount.findMany({
      where: { pulperiaId: req.user.pulperia.id },
      include: {
        client: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { currentBalance: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calcular días desde último pago y agregar indicador de alerta
    const enrichedAccounts = accounts.map(account => {
      const daysSincePayment = account.lastPaymentAt
        ? Math.floor((Date.now() - new Date(account.lastPaymentAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let alertLevel = 'green'; // Sin deuda o pago reciente
      if (account.currentBalance > 0) {
        if (daysSincePayment === null || daysSincePayment > 15) {
          alertLevel = 'red';
        } else if (daysSincePayment > 7) {
          alertLevel = 'yellow';
        }
      }

      return {
        ...account,
        daysSincePayment,
        alertLevel,
      };
    });

    // Calcular totales
    const totalFiado = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const clientsWithDebt = accounts.filter(a => a.currentBalance > 0).length;

    res.json({
      accounts: enrichedAccounts,
      summary: {
        totalFiado,
        totalClients: accounts.length,
        clientsWithDebt,
      },
    });
  } catch (error) {
    console.error('Get fiado accounts error:', error);
    res.status(500).json({ error: { message: 'Error al obtener cuentas de fiado' } });
  }
});

// Get single fiado account with full history
router.get('/accounts/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const account = await prisma.fiadoAccount.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
      include: {
        client: {
          select: { id: true, name: true, phone: true, avatar: true, email: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      return res.status(404).json({ error: { message: 'Cuenta de fiado no encontrada' } });
    }

    res.json({ account });
  } catch (error) {
    console.error('Get fiado account error:', error);
    res.status(500).json({ error: { message: 'Error al obtener cuenta de fiado' } });
  }
});

// Get my fiado accounts (as client)
router.get('/my-accounts', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.fiadoAccount.findMany({
      where: { clientId: req.user.id },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    res.json({ accounts });
  } catch (error) {
    console.error('Get my fiado accounts error:', error);
    res.status(500).json({ error: { message: 'Error al obtener tus cuentas de fiado' } });
  }
});

// Create or update fiado account for a client
router.post('/accounts', authenticate, requirePulperia, async (req, res) => {
  try {
    const { clientId, creditLimit } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: { message: 'ID de cliente requerido' } });
    }

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ error: { message: 'Cliente no encontrado' } });
    }

    // Crear o actualizar cuenta
    const account = await prisma.fiadoAccount.upsert({
      where: {
        pulperiaId_clientId: {
          pulperiaId: req.user.pulperia.id,
          clientId,
        },
      },
      update: {
        creditLimit: creditLimit || 0,
        isBlocked: false,
      },
      create: {
        pulperiaId: req.user.pulperia.id,
        clientId,
        creditLimit: creditLimit || 500, // Límite por defecto L. 500
      },
      include: {
        client: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
    });

    res.status(201).json({ account });
  } catch (error) {
    console.error('Create fiado account error:', error);
    res.status(500).json({ error: { message: 'Error al crear cuenta de fiado' } });
  }
});

// Update fiado account (credit limit, block status)
router.patch('/accounts/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const { creditLimit, isBlocked } = req.body;

    const existing = await prisma.fiadoAccount.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Cuenta de fiado no encontrada' } });
    }

    const account = await prisma.fiadoAccount.update({
      where: { id: req.params.id },
      data: {
        ...(creditLimit !== undefined && { creditLimit }),
        ...(isBlocked !== undefined && { isBlocked }),
      },
      include: {
        client: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
    });

    res.json({ account });
  } catch (error) {
    console.error('Update fiado account error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar cuenta de fiado' } });
  }
});

// Add transaction (credit or payment)
router.post('/accounts/:id/transactions', authenticate, requirePulperia, async (req, res) => {
  try {
    const { type, amount, orderId, note } = req.body;

    if (!type || !amount || amount <= 0) {
      return res.status(400).json({
        error: { message: 'Tipo y monto positivo son requeridos' }
      });
    }

    if (!['CREDIT', 'PAYMENT'].includes(type)) {
      return res.status(400).json({
        error: { message: 'Tipo debe ser CREDIT o PAYMENT' }
      });
    }

    const existing = await prisma.fiadoAccount.findFirst({
      where: {
        id: req.params.id,
        pulperiaId: req.user.pulperia.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: { message: 'Cuenta de fiado no encontrada' } });
    }

    // Verificar límite de crédito si es un nuevo cargo
    if (type === 'CREDIT') {
      const newBalance = existing.currentBalance + amount;
      if (newBalance > existing.creditLimit) {
        return res.status(400).json({
          error: {
            message: `El monto excede el límite de crédito. Disponible: L. ${(existing.creditLimit - existing.currentBalance).toFixed(2)}`
          }
        });
      }

      if (existing.isBlocked) {
        return res.status(400).json({
          error: { message: 'Esta cuenta de fiado está bloqueada' }
        });
      }
    }

    // Crear transacción y actualizar balance en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.fiadoTransaction.create({
        data: {
          accountId: req.params.id,
          type,
          amount,
          orderId,
          note,
        },
      });

      const balanceChange = type === 'CREDIT' ? amount : -amount;
      const account = await tx.fiadoAccount.update({
        where: { id: req.params.id },
        data: {
          currentBalance: { increment: balanceChange },
          ...(type === 'PAYMENT' && { lastPaymentAt: new Date() }),
        },
        include: {
          client: {
            select: { id: true, name: true, phone: true, avatar: true },
          },
        },
      });

      return { transaction, account };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Add fiado transaction error:', error);
    res.status(500).json({ error: { message: 'Error al registrar transacción' } });
  }
});

// Search clients (for adding to fiado)
router.get('/search-clients', authenticate, requirePulperia, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ clients: [] });
    }

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
      take: 10,
    });

    // Verificar cuáles ya tienen cuenta de fiado
    const existingAccounts = await prisma.fiadoAccount.findMany({
      where: {
        pulperiaId: req.user.pulperia.id,
        clientId: { in: clients.map(c => c.id) },
      },
      select: { clientId: true },
    });

    const existingIds = new Set(existingAccounts.map(a => a.clientId));

    const enrichedClients = clients.map(c => ({
      ...c,
      hasFiadoAccount: existingIds.has(c.id),
    }));

    res.json({ clients: enrichedClients });
  } catch (error) {
    console.error('Search clients error:', error);
    res.status(500).json({ error: { message: 'Error al buscar clientes' } });
  }
});

export default router;
