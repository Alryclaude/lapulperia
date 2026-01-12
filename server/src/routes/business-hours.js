import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requirePulperia } from '../middleware/auth.js';

const router = express.Router();

// Get my business hours
router.get('/', authenticate, requirePulperia, async (req, res) => {
  try {
    const businessHours = await prisma.businessHours.findUnique({
      where: { pulperiaId: req.user.pulperia.id },
    });

    res.json({ businessHours });
  } catch (error) {
    console.error('Get business hours error:', error);
    res.status(500).json({ error: { message: 'Error al obtener horarios' } });
  }
});

// Get business hours by pulperia ID (public)
router.get('/pulperia/:pulperiaId', async (req, res) => {
  try {
    const businessHours = await prisma.businessHours.findUnique({
      where: { pulperiaId: req.params.pulperiaId },
    });

    res.json({ businessHours });
  } catch (error) {
    console.error('Get business hours error:', error);
    res.status(500).json({ error: { message: 'Error al obtener horarios' } });
  }
});

// Create or update business hours
router.put('/', authenticate, requirePulperia, async (req, res) => {
  try {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

    // Validate day format
    const validateDay = (day) => {
      if (!day) return null;
      if (day.closed) return { closed: true };
      if (!day.open || !day.close) return null;
      // Validate time format HH:MM
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(day.open) || !timeRegex.test(day.close)) {
        return null;
      }
      return { open: day.open, close: day.close, closed: false };
    };

    const businessHours = await prisma.businessHours.upsert({
      where: { pulperiaId: req.user.pulperia.id },
      create: {
        pulperiaId: req.user.pulperia.id,
        monday: validateDay(monday),
        tuesday: validateDay(tuesday),
        wednesday: validateDay(wednesday),
        thursday: validateDay(thursday),
        friday: validateDay(friday),
        saturday: validateDay(saturday),
        sunday: validateDay(sunday),
      },
      update: {
        monday: validateDay(monday),
        tuesday: validateDay(tuesday),
        wednesday: validateDay(wednesday),
        thursday: validateDay(thursday),
        friday: validateDay(friday),
        saturday: validateDay(saturday),
        sunday: validateDay(sunday),
      },
    });

    res.json({ businessHours });
  } catch (error) {
    console.error('Update business hours error:', error);
    res.status(500).json({ error: { message: 'Error al guardar horarios' } });
  }
});

export default router;
