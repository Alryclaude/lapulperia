import { verifyToken } from '../services/firebase.js';
import prisma from '../services/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Token no proporcionado' } });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        pulperia: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: { message: 'Usuario no encontrado' } });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: { message: 'Token inválido' } });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        pulperia: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

export const requirePulperia = (req, res, next) => {
  if (!req.user || req.user.role !== 'PULPERIA' || !req.user.pulperia) {
    return res.status(403).json({ error: { message: 'Acceso solo para pulperías' } });
  }
  next();
};

export const requireClient = (req, res, next) => {
  if (!req.user || req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: { message: 'Acceso solo para clientes' } });
  }
  next();
};
