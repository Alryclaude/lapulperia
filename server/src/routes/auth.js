import express from 'express';
import prisma from '../services/prisma.js';
import { verifyToken } from '../services/firebase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register or login user
router.post('/login', async (req, res) => {
  try {
    const { token, name, email, avatar, role, pulperiaData } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyToken(token);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { pulperia: true },
    });

    if (user) {
      // Update user info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          avatar: avatar || user.avatar,
        },
        include: { pulperia: true },
      });

      return res.json({ user, isNewUser: false });
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        firebaseUid: decodedToken.uid,
        email: email || decodedToken.email,
        name: name || decodedToken.name || 'Usuario',
        avatar: avatar || decodedToken.picture,
        role: role || 'CLIENT',
      },
      include: { pulperia: true },
    });

    // If role is PULPERIA, create pulperia profile
    if (role === 'PULPERIA' && pulperiaData) {
      const isOnline = pulperiaData.isOnlineOnly || false;

      const pulperia = await prisma.pulperia.create({
        data: {
          userId: user.id,
          name: pulperiaData.name,
          latitude: isOnline ? null : pulperiaData.latitude,
          longitude: isOnline ? null : pulperiaData.longitude,
          address: isOnline ? null : pulperiaData.address,
          reference: pulperiaData.reference,
          phone: pulperiaData.phone,
          whatsapp: pulperiaData.whatsapp,
          isOnlineOnly: isOnline,
          originCity: pulperiaData.originCity || null,
          shippingScope: pulperiaData.shippingScope || 'LOCAL',
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { pulperia: true },
      });
    }

    res.status(201).json({ user, isNewUser: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Error al iniciar sesión' } });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        pulperia: {
          include: {
            achievements: true,
          },
        },
        serviceCatalogs: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Error al obtener usuario' } });
  }
});

// Update user profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      },
      include: { pulperia: true },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: { message: 'Error al actualizar usuario' } });
  }
});

// Create pulperia for existing user
router.post('/create-pulperia', authenticate, async (req, res) => {
  try {
    if (req.user.pulperia) {
      return res.status(409).json({ error: { message: 'Ya tienes una pulpería' } });
    }

    const {
      name,
      latitude,
      longitude,
      address,
      reference,
      phone,
      whatsapp,
      isOnlineOnly,
      originCity,
      shippingScope
    } = req.body;

    // Validacion condicional segun tipo de negocio
    if (!isOnlineOnly && (!address || latitude === null || longitude === null)) {
      return res.status(400).json({
        error: { message: 'Los negocios fisicos requieren direccion y ubicacion' }
      });
    }

    if (isOnlineOnly && !originCity) {
      return res.status(400).json({
        error: { message: 'Los negocios online requieren ciudad de origen' }
      });
    }

    // Update user role
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'PULPERIA' },
    });

    // Create pulperia
    const pulperia = await prisma.pulperia.create({
      data: {
        userId: req.user.id,
        name,
        latitude: isOnlineOnly ? null : latitude,
        longitude: isOnlineOnly ? null : longitude,
        address: isOnlineOnly ? null : address,
        reference,
        phone,
        whatsapp,
        isOnlineOnly: isOnlineOnly || false,
        originCity: originCity || null,
        shippingScope: shippingScope || 'LOCAL',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { pulperia: true },
    });

    res.status(201).json({ user, pulperia });
  } catch (error) {
    console.error('Create pulperia error:', error);
    res.status(500).json({ error: { message: 'Error al crear pulpería' } });
  }
});

// Export user data
router.get('/export', authenticate, async (req, res) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        pulperia: {
          include: {
            products: true,
            orders: {
              include: { items: true },
            },
            reviews: true,
            jobs: true,
            dailyStats: true,
          },
        },
        orders: {
          include: { items: true },
        },
        reviews: true,
        serviceCatalogs: true,
        favorites: {
          include: {
            pulperia: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.json({
      exportDate: new Date().toISOString(),
      user: userData,
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: { message: 'Error al exportar datos' } });
  }
});

// Register FCM push token
router.post('/register-push-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: { message: 'Token FCM requerido' } });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fcmToken,
        fcmTokenUpdatedAt: new Date(),
      },
    });

    res.json({ success: true, message: 'Token registrado exitosamente' });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({ error: { message: 'Error al registrar token' } });
  }
});

// Delete FCM push token (for logout)
router.delete('/push-token', authenticate, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fcmToken: null,
        fcmTokenUpdatedAt: null,
      },
    });

    res.json({ success: true, message: 'Token eliminado exitosamente' });
  } catch (error) {
    console.error('Delete FCM token error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar token' } });
  }
});

// Delete account
router.delete('/me', authenticate, async (req, res) => {
  try {
    const { downloadData } = req.query;

    let exportData = null;

    if (downloadData === 'true') {
      // Gather all user data for export
      const userData = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          pulperia: {
            include: {
              products: true,
              orders: true,
              reviews: true,
              jobs: true,
              dailyStats: true,
            },
          },
          orders: {
            include: { items: true },
          },
          reviews: true,
          serviceCatalogs: true,
        },
      });

      exportData = userData;
    }

    // Delete user (cascades to all related data)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({
      message: 'Cuenta eliminada exitosamente',
      exportData
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: { message: 'Error al eliminar cuenta' } });
  }
});

export default router;
