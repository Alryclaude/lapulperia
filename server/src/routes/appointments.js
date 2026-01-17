import express from 'express';
import prisma from '../services/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// LISTAR CITAS (para el negocio)
// ═══════════════════════════════════════════════════════════════

router.get('/', authenticate, async (req, res) => {
  try {
    const { date, status, pulperiaId } = req.query;

    // Verificar que el usuario tiene pulpería
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const where = {
      pulperiaId: pulperiaId || user.pulperia.id
    };

    // Filtrar por fecha
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, avatar: true, phone: true }
        },
        chamba: {
          select: { id: true, title: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: { message: 'Error al cargar citas' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// MIS CITAS (como cliente)
// ═══════════════════════════════════════════════════════════════

router.get('/my', authenticate, async (req, res) => {
  try {
    const { status } = req.query;

    const where = { clientId: req.user.id };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pulperia: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            whatsapp: true,
            address: true
          }
        },
        chamba: {
          select: { id: true, title: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching my appointments:', error);
    res.status(500).json({ error: { message: 'Error al cargar mis citas' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// DETALLE DE CITA
// ═══════════════════════════════════════════════════════════════

router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
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
        client: {
          select: { id: true, name: true, avatar: true, phone: true }
        },
        chamba: {
          select: { id: true, title: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Cita no encontrada' } });
    }

    // Solo el cliente o el dueño del negocio pueden ver
    if (appointment.clientId !== req.user.id && appointment.pulperia?.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: { message: 'Error al cargar cita' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// CREAR CITA
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, async (req, res) => {
  try {
    const {
      pulperiaId,
      chambaId,
      clientName,
      clientPhone,
      serviceName,
      date,
      timeSlot,
      duration,
      agreedPrice,
      notes
    } = req.body;

    if (!serviceName || !date || !timeSlot) {
      return res.status(400).json({
        error: { message: 'Servicio, fecha y hora son requeridos' }
      });
    }

    // Si no hay pulperiaId, usar la del usuario actual
    let targetPulperiaId = pulperiaId;
    if (!targetPulperiaId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { pulperia: true }
      });

      if (!user.pulperia) {
        return res.status(400).json({ error: { message: 'Se requiere ID de pulpería' } });
      }
      targetPulperiaId = user.pulperia.id;
    }

    // Verificar disponibilidad del horario
    const appointmentDate = new Date(date);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        pulperiaId: targetPulperiaId,
        date: appointmentDate,
        timeSlot: timeSlot,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        error: { message: 'Este horario ya está ocupado' }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        pulperiaId: targetPulperiaId,
        chambaId: chambaId || null,
        clientId: req.user.id,
        clientName: clientName || req.user.name,
        clientPhone,
        serviceName,
        date: appointmentDate,
        timeSlot,
        duration: duration || 60,
        agreedPrice: agreedPrice ? parseFloat(agreedPrice) : null,
        notes
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        client: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: { message: 'Error al crear cita' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACTUALIZAR ESTADO DE CITA
// ═══════════════════════════════════════════════════════════════

router.put('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: { select: { userId: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Cita no encontrada' } });
    }

    // Solo el dueño del negocio o el cliente pueden actualizar
    const isOwner = appointment.pulperia?.userId === req.user.id;
    const isClient = appointment.clientId === req.user.id;

    if (!isOwner && !isClient) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    const {
      status,
      date,
      timeSlot,
      duration,
      agreedPrice,
      notes
    } = req.body;

    // El cliente solo puede cancelar
    if (isClient && !isOwner && status && status !== 'CANCELLED') {
      return res.status(403).json({
        error: { message: 'Solo puedes cancelar tu cita' }
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status,
        date: date ? new Date(date) : undefined,
        timeSlot,
        duration,
        agreedPrice: agreedPrice !== undefined ? (agreedPrice ? parseFloat(agreedPrice) : null) : undefined,
        notes
      },
      include: {
        pulperia: {
          select: { id: true, name: true, logo: true }
        },
        client: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: { message: 'Error al actualizar cita' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ELIMINAR CITA
// ═══════════════════════════════════════════════════════════════

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        pulperia: { select: { userId: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Cita no encontrada' } });
    }

    // Solo el dueño del negocio puede eliminar
    if (appointment.pulperia?.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'No autorizado' } });
    }

    await prisma.appointment.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: { message: 'Error al eliminar cita' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// HORARIOS DISPONIBLES
// ═══════════════════════════════════════════════════════════════

router.get('/available/:pulperiaId', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: { message: 'Se requiere fecha' } });
    }

    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener citas existentes
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        pulperiaId: req.params.pulperiaId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      },
      select: { timeSlot: true, duration: true }
    });

    const bookedSlots = bookedAppointments.map(a => a.timeSlot);

    // Generar horarios disponibles (8:00 - 18:00, cada 30 min)
    const allSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      date,
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: { message: 'Error al cargar horarios' } });
  }
});

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS DE CITAS
// ═══════════════════════════════════════════════════════════════

router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true }
    });

    if (!user.pulperia) {
      return res.status(403).json({ error: { message: 'No tienes un negocio registrado' } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [todayCount, weekCount, pendingCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          pulperiaId: user.pulperia.id,
          date: { gte: today, lt: tomorrow },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] }
        }
      }),
      prisma.appointment.count({
        where: {
          pulperiaId: user.pulperia.id,
          date: { gte: today, lt: nextWeek },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] }
        }
      }),
      prisma.appointment.count({
        where: {
          pulperiaId: user.pulperia.id,
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }),
      prisma.appointment.count({
        where: {
          pulperiaId: user.pulperia.id,
          status: 'COMPLETED'
        }
      })
    ]);

    res.json({
      todayCount,
      weekCount,
      pendingCount,
      completedCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: { message: 'Error al cargar estadísticas' } });
  }
});

export default router;
