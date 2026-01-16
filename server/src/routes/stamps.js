import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Obtener stamps del usuario (Pasaporte)
router.get('/my-stamps', authenticate, async (req, res) => {
  try {
    const stamps = await prisma.stamp.findMany({
      where: { userId: req.user.id },
      include: {
        pulperia: {
          select: { name: true, id: true, logo: true }
        }
      },
      orderBy: { collectedAt: 'desc' }
    });

    // Transformar para el frontend
    const formattedStamps = stamps.map(s => ({
      id: s.id,
      pulperiaName: s.pulperia.name,
      pulperiaId: s.pulperia.id,
      pulperiaLogo: s.pulperia.logo,
      collectedAt: s.collectedAt,
      icon: s.icon || '🏪',
      rarity: s.rarity || 'COMMON'
    }));

    res.json(formattedStamps);
  } catch (error) {
    console.error('Error fetching stamps:', error);
    res.status(500).json({ error: { message: 'Error al cargar el pasaporte' } });
  }
});

// Estadísticas del pasaporte
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalStamps = await prisma.stamp.count({
      where: { userId: req.user.id }
    });

    const uniqueBusinesses = await prisma.stamp.findMany({
      where: { userId: req.user.id },
      distinct: ['pulperiaId']
    });

    const legendaryCount = await prisma.stamp.count({
      where: {
        userId: req.user.id,
        rarity: 'LEGENDARY'
      }
    });

    res.json({
      totalStamps,
      uniqueBusinesses: uniqueBusinesses.length,
      legendaryCount,
      level: Math.floor(totalStamps / 5) + 1,
      progress: (totalStamps % 5) * 20
    });
  } catch (error) {
    console.error('Error fetching stamp stats:', error);
    res.status(500).json({ error: { message: 'Error al cargar estadísticas' } });
  }
});

// Recolectar un nuevo stamp (Check-in después de compra)
router.post('/collect', authenticate, async (req, res) => {
  try {
    const { pulperiaId } = req.body;

    if (!pulperiaId) {
      return res.status(400).json({ error: { message: 'ID de pulpería requerido' } });
    }

    // Verificar que la pulpería existe
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: pulperiaId }
    });

    if (!pulperia) {
      return res.status(404).json({ error: { message: 'Pulpería no encontrada' } });
    }

    // Verificar si ya tiene un stamp hoy (cooldown de 24h)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await prisma.stamp.findFirst({
      where: {
        userId: req.user.id,
        pulperiaId: pulperiaId,
        collectedAt: { gte: today }
      }
    });

    if (existingToday) {
      return res.status(400).json({ error: { message: 'Ya tienes un sello de este negocio hoy' } });
    }

    // Determinar rareza (10% legendary, 25% rare, 65% common)
    const rand = Math.random();
    let rarity = 'COMMON';
    if (rand > 0.9) rarity = 'LEGENDARY';
    else if (rand > 0.65) rarity = 'RARE';

    // Iconos por categoría
    const icons = ['🛒', '🏪', '🌮', '☕', '💈', '🔧', '🌟', '🎯', '🚀', '💎'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    // Crear stamp
    const stamp = await prisma.stamp.create({
      data: {
        userId: req.user.id,
        pulperiaId: pulperiaId,
        icon: randomIcon,
        rarity: rarity,
        collectedAt: new Date()
      },
      include: { pulperia: { select: { name: true } } }
    });

    res.status(201).json({
      success: true,
      stamp: {
        id: stamp.id,
        pulperiaName: stamp.pulperia.name,
        icon: stamp.icon,
        rarity: stamp.rarity,
        collectedAt: stamp.collectedAt
      },
      message: rarity === 'LEGENDARY'
        ? '¡Sello LEGENDARIO recolectado!'
        : '¡Sello recolectado!'
    });

  } catch (error) {
    console.error('Error collecting stamp:', error);
    res.status(500).json({ error: { message: 'Error al recolectar sello' } });
  }
});

export default router;
