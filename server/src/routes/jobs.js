import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate, optionalAuth, requirePulperia } from '../middleware/auth.js';
import { uploadCV } from '../services/cloudinary.js';

const router = express.Router();

// Get all jobs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 10000, isUrgent, isPartTime, search, limit = 50, offset = 0 } = req.query;

    const where = {
      isActive: true,
      pulperia: {
        isPermanentlyClosed: false,
      },
    };

    if (isUrgent === 'true') {
      where.isUrgent = true;
    }

    if (isPartTime === 'true') {
      where.isPartTime = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let jobs = await prisma.job.findMany({
      where,
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Filter by distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      jobs = jobs.filter((j) => {
        const distance = getDistance(userLat, userLng, j.pulperia.latitude, j.pulperia.longitude);
        j.distance = distance;
        return distance <= maxRadius;
      });

      jobs.sort((a, b) => a.distance - b.distance);
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: { message: 'Error al obtener empleos' } });
  }
});

// Get pulperia's jobs
router.get('/my-jobs', authenticate, requirePulperia, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { pulperiaId: req.user.pulperia.id },
      include: {
        applications: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: { message: 'Error al obtener empleos' } });
  }
});

// Get user's applications
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user.id },
      include: {
        job: {
          include: {
            pulperia: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: { message: 'Error al obtener aplicaciones' } });
  }
});

// Get single job
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            address: true,
            phone: true,
            whatsapp: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: { message: 'Empleo no encontrado' } });
    }

    // Check if user has applied
    let hasApplied = false;
    if (req.user) {
      const application = await prisma.jobApplication.findUnique({
        where: {
          jobId_userId: {
            jobId: req.params.id,
            userId: req.user.id,
          },
        },
      });
      hasApplied = !!application;
    }

    res.json({ job, hasApplied });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: { message: 'Error al obtener empleo' } });
  }
});

// Create job (pulperia only)
router.post('/', authenticate, requirePulperia, async (req, res) => {
  try {
    const { title, description, requirements, salary, isPartTime, isUrgent } = req.body;

    const job = await prisma.job.create({
      data: {
        pulperiaId: req.user.pulperia.id,
        title,
        description,
        requirements,
        salary,
        isPartTime: isPartTime || false,
        isUrgent: isUrgent || false,
      },
    });

    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: { message: 'Error al crear empleo' } });
  }
});

// Update job
router.patch('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!job) {
      return res.status(404).json({ error: { message: 'Empleo no encontrado' } });
    }

    const { title, description, requirements, salary, isPartTime, isUrgent, isActive } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(salary !== undefined && { salary }),
        ...(isPartTime !== undefined && { isPartTime }),
        ...(isUrgent !== undefined && { isUrgent }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar empleo' } });
  }
});

// Delete job
router.delete('/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, pulperiaId: req.user.pulperia.id },
    });

    if (!job) {
      return res.status(404).json({ error: { message: 'Empleo no encontrado' } });
    }

    await prisma.job.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Empleo eliminado' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar empleo' } });
  }
});

// Apply to job
router.post('/:id/apply', authenticate, uploadCV.single('cv'), async (req, res) => {
  try {
    const { coverLetter } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });

    if (!job || !job.isActive) {
      return res.status(404).json({ error: { message: 'Empleo no disponible' } });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({ error: { message: 'Ya aplicaste a este empleo' } });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.id,
        userId: req.user.id,
        coverLetter,
        cvUrl: req.file?.path,
        cvPublicId: req.file?.filename,
      },
    });

    // Notify pulperia
    const io = req.app.get('io');
    const pulperia = await prisma.pulperia.findUnique({
      where: { id: job.pulperiaId },
    });
    io.to(pulperia.userId).emit('new-application', {
      jobId: job.id,
      jobTitle: job.title,
      applicantName: req.user.name,
    });

    res.status(201).json({ application });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: { message: 'Error al aplicar' } });
  }
});

// Update application status (pulperia only)
router.patch('/applications/:id', authenticate, requirePulperia, async (req, res) => {
  try {
    const { status, responseMessage, contactInfo } = req.body;

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: req.params.id,
        job: { pulperiaId: req.user.pulperia.id },
      },
      include: { job: true, user: true },
    });

    if (!application) {
      return res.status(404).json({ error: { message: 'Aplicación no encontrada' } });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: {
        status,
        responseMessage,
        contactInfo,
      },
    });

    // Notify applicant
    const io = req.app.get('io');
    io.to(application.userId).emit('application-updated', {
      jobTitle: application.job.title,
      status,
      message: status === 'ACCEPTED' ? '¡Felicidades! Tu aplicación fue aceptada.' : 'Tu aplicación fue revisada.',
    });

    res.json({ application: updatedApplication });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar aplicación' } });
  }
});

// Helper function
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default router;
