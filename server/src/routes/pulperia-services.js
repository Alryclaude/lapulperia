import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadProduct, deleteImage } from '../services/cloudinary.js';

const router = express.Router();

// Get my services (pulperia owner)
router.get('/my-services', authenticate, requirePulperia, async (req, res) => {
  try {
    const services = await prisma.pulperiaService.findMany({
      where: { pulperiaId: req.user.pulperia.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: { message: 'Error al obtener servicios' } });
  }
});

// Get services by pulperia (public)
router.get('/pulperia/:pulperiaId', optionalAuth, async (req, res) => {
  try {
    const services = await prisma.pulperiaService.findMany({
      where: {
        pulperiaId: req.params.pulperiaId,
        isAvailable: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: { message: 'Error al obtener servicios' } });
  }
});

// Get single service
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const service = await prisma.pulperiaService.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: { message: 'Servicio no encontrado' } });
    }

    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: { message: 'Error al obtener servicio' } });
  }
});

// Create service
router.post('/', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const { name, description, price, priceMax, priceType, duration } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: { message: 'El nombre del servicio es requerido' } });
    }

    const validPriceTypes = ['FIXED', 'HOURLY', 'NEGOTIABLE'];
    const finalPriceType = validPriceTypes.includes(priceType) ? priceType : 'FIXED';

    const service = await prisma.pulperiaService.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        name,
        description,
        price: price ? parseFloat(price) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        priceType: finalPriceType,
        duration,
        imageUrl: req.file?.path || null,
        imagePublicId: req.file?.filename || null,
      },
    });

    res.status(201).json({ service });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: { message: 'Error al crear servicio' } });
  }
});

// Update service
router.patch('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const service = await prisma.pulperiaService.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!service) {
      return res.status(404).json({ error: { message: 'Servicio no encontrado' } });
    }

    const { name, description, price, priceMax, priceType, duration, isAvailable } = req.body;

    const updatedService = await prisma.pulperiaService.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(priceMax !== undefined && { priceMax: priceMax ? parseFloat(priceMax) : null }),
        ...(priceType && { priceType }),
        ...(duration !== undefined && { duration }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    res.json({ service: updatedService });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar servicio' } });
  }
});

// Update service image
router.patch('/:id/image', authenticate, requirePulperia, uploadProduct.single('image'), async (req, res) => {
  try {
    const service = await prisma.pulperiaService.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!service) {
      return res.status(404).json({ error: { message: 'Servicio no encontrado' } });
    }

    if (!req.file) {
      return res.status(400).json({ error: { message: 'Se requiere imagen' } });
    }

    // Delete old image
    if (service.imagePublicId) {
      await deleteImage(service.imagePublicId);
    }

    const updatedService = await prisma.pulperiaService.update({
      where: { id: req.params.id },
      data: {
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
      },
    });

    res.json({ service: updatedService });
  } catch (error) {
    console.error('Update service image error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar imagen' } });
  }
});

// Delete service
router.delete('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const service = await prisma.pulperiaService.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!service) {
      return res.status(404).json({ error: { message: 'Servicio no encontrado' } });
    }

    // Delete image from cloudinary
    if (service.imagePublicId) {
      await deleteImage(service.imagePublicId);
    }

    await prisma.pulperiaService.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Servicio eliminado' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar servicio' } });
  }
});

export default router;
