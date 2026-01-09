import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user's own reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: { message: 'Error al obtener reseñas' } });
  }
});

// Get reviews for a pulperia
router.get('/pulperia/:pulperiaId', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { pulperiaId: req.params.pulperiaId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const stats = await prisma.review.aggregate({
      where: { pulperiaId: req.params.pulperiaId },
      _avg: { rating: true },
      _count: true,
    });

    // Rating distribution
    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { pulperiaId: req.params.pulperiaId },
      _count: true,
    });

    res.json({
      reviews,
      stats: {
        average: stats._avg.rating || 0,
        total: stats._count,
        distribution: distribution.reduce((acc, d) => {
          acc[d.rating] = d._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: { message: 'Error al obtener reseñas' } });
  }
});

// Create review
router.post('/', authenticate, async (req, res) => {
  try {
    const { pulperiaId, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: { message: 'Rating debe ser entre 1 y 5' } });
    }

    // Check if user has made a purchase from this pulperia
    const hasOrdered = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        pulperiaId,
        status: 'DELIVERED',
      },
    });

    if (!hasOrdered) {
      return res.status(400).json({ error: { message: 'Solo puedes reseñar después de una compra' } });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_pulperiaId: {
          userId: req.user.id,
          pulperiaId,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({ error: { message: 'Ya dejaste una reseña' } });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        pulperiaId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update pulperia rating
    const stats = await prisma.review.aggregate({
      where: { pulperiaId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.pulperia.update({
      where: { id: pulperiaId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    // Check for 5 star achievement
    if (stats._avg.rating >= 5 && stats._count >= 5) {
      await prisma.achievement.upsert({
        where: {
          pulperiaId_type: {
            pulperiaId,
            type: 'FIVE_STARS',
          },
        },
        update: {},
        create: {
          pulperiaId,
          type: 'FIVE_STARS',
        },
      });
    }

    res.status(201).json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: { message: 'Error al crear reseña' } });
  }
});

// Update review
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!review) {
      return res.status(404).json({ error: { message: 'Reseña no encontrada' } });
    }

    const { rating, comment } = req.body;

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Recalculate pulperia rating
    const stats = await prisma.review.aggregate({
      where: { pulperiaId: review.pulperiaId },
      _avg: { rating: true },
    });

    await prisma.pulperia.update({
      where: { id: review.pulperiaId },
      data: { rating: stats._avg.rating || 0 },
    });

    res.json({ review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar reseña' } });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!review) {
      return res.status(404).json({ error: { message: 'Reseña no encontrada' } });
    }

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    // Recalculate pulperia rating
    const stats = await prisma.review.aggregate({
      where: { pulperiaId: review.pulperiaId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.pulperia.update({
      where: { id: review.pulperiaId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar reseña' } });
  }
});

export default router;
