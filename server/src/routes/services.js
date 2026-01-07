import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadService, deleteImage } from '../services/cloudinary.js';

const router = express.Router();

// Get all service catalogs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { profession, search, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (profession) {
      where.profession = { contains: profession, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { profession: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const catalogs = await prisma.serviceCatalog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Get unique professions
    const professions = await prisma.serviceCatalog.findMany({
      select: { profession: true },
      distinct: ['profession'],
    });

    res.json({
      catalogs,
      professions: professions.map((p) => p.profession),
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: { message: 'Error al obtener servicios' } });
  }
});

// Get user's service catalogs
router.get('/my-catalogs', authenticate, async (req, res) => {
  try {
    const catalogs = await prisma.serviceCatalog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ catalogs });
  } catch (error) {
    console.error('Get my catalogs error:', error);
    res.status(500).json({ error: { message: 'Error al obtener catálogos' } });
  }
});

// Get single catalog
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const catalog = await prisma.serviceCatalog.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true },
        },
      },
    });

    if (!catalog) {
      return res.status(404).json({ error: { message: 'Catálogo no encontrado' } });
    }

    res.json({ catalog });
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ error: { message: 'Error al obtener catálogo' } });
  }
});

// Get catalogs by user
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const catalogs = await prisma.serviceCatalog.findMany({
      where: { userId: req.params.userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ catalogs });
  } catch (error) {
    console.error('Get user catalogs error:', error);
    res.status(500).json({ error: { message: 'Error al obtener catálogos' } });
  }
});

// Create service catalog
router.post('/', authenticate, uploadService.array('images', 6), async (req, res) => {
  try {
    const { profession, description, contactPhone, contactWhatsapp } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'Se requiere al menos una imagen' } });
    }

    // Check if user already has this profession
    const existing = await prisma.serviceCatalog.findFirst({
      where: {
        userId: req.user.id,
        profession: { equals: profession, mode: 'insensitive' },
      },
    });

    if (existing) {
      return res.status(400).json({ error: { message: 'Ya tienes un catálogo para esta profesión' } });
    }

    const catalog = await prisma.serviceCatalog.create({
      data: {
        userId: req.user.id,
        profession,
        description,
        contactPhone,
        contactWhatsapp,
        images: req.files.map((f) => f.path),
        imagePublicIds: req.files.map((f) => f.filename),
      },
    });

    res.status(201).json({ catalog });
  } catch (error) {
    console.error('Create catalog error:', error);
    res.status(500).json({ error: { message: 'Error al crear catálogo' } });
  }
});

// Update service catalog
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const catalog = await prisma.serviceCatalog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!catalog) {
      return res.status(404).json({ error: { message: 'Catálogo no encontrado' } });
    }

    const { description, contactPhone, contactWhatsapp } = req.body;

    const updatedCatalog = await prisma.serviceCatalog.update({
      where: { id: req.params.id },
      data: {
        ...(description !== undefined && { description }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactWhatsapp !== undefined && { contactWhatsapp }),
      },
    });

    res.json({ catalog: updatedCatalog });
  } catch (error) {
    console.error('Update catalog error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar catálogo' } });
  }
});

// Add images to catalog
router.post('/:id/images', authenticate, uploadService.array('images', 6), async (req, res) => {
  try {
    const catalog = await prisma.serviceCatalog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!catalog) {
      return res.status(404).json({ error: { message: 'Catálogo no encontrado' } });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'No se proporcionaron imágenes' } });
    }

    // Check total images limit (6)
    if (catalog.images.length + req.files.length > 6) {
      return res.status(400).json({ error: { message: 'Máximo 6 imágenes por catálogo' } });
    }

    const updatedCatalog = await prisma.serviceCatalog.update({
      where: { id: req.params.id },
      data: {
        images: {
          push: req.files.map((f) => f.path),
        },
        imagePublicIds: {
          push: req.files.map((f) => f.filename),
        },
      },
    });

    res.json({ catalog: updatedCatalog });
  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({ error: { message: 'Error al agregar imágenes' } });
  }
});

// Remove image from catalog
router.delete('/:id/images/:imageIndex', authenticate, async (req, res) => {
  try {
    const catalog = await prisma.serviceCatalog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!catalog) {
      return res.status(404).json({ error: { message: 'Catálogo no encontrado' } });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= catalog.images.length) {
      return res.status(400).json({ error: { message: 'Índice de imagen inválido' } });
    }

    // Delete from Cloudinary
    if (catalog.imagePublicIds[imageIndex]) {
      await deleteImage(catalog.imagePublicIds[imageIndex]);
    }

    const newImages = [...catalog.images];
    const newPublicIds = [...catalog.imagePublicIds];
    newImages.splice(imageIndex, 1);
    newPublicIds.splice(imageIndex, 1);

    const updatedCatalog = await prisma.serviceCatalog.update({
      where: { id: req.params.id },
      data: {
        images: newImages,
        imagePublicIds: newPublicIds,
      },
    });

    res.json({ catalog: updatedCatalog });
  } catch (error) {
    console.error('Remove image error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar imagen' } });
  }
});

// Delete service catalog
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const catalog = await prisma.serviceCatalog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!catalog) {
      return res.status(404).json({ error: { message: 'Catálogo no encontrado' } });
    }

    // Delete all images from Cloudinary
    for (const publicId of catalog.imagePublicIds) {
      await deleteImage(publicId);
    }

    await prisma.serviceCatalog.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Catálogo eliminado' });
  } catch (error) {
    console.error('Delete catalog error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar catálogo' } });
  }
});

export default router;
