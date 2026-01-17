import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { verifyToken } from './services/firebase.js';
import prisma from './services/prisma.js';

// Routes
import authRoutes from './routes/auth.js';
import pulperiaRoutes from './routes/pulperia.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import jobRoutes from './routes/jobs.js';
import reviewRoutes from './routes/reviews.js';
import statsRoutes from './routes/stats.js';
import serviceRoutes from './routes/services.js';
import uploadRoutes from './routes/upload.js';
import businessHoursRoutes from './routes/business-hours.js';
import promotionsRoutes from './routes/promotions.js';
import pulperiaServicesRoutes from './routes/pulperia-services.js';
import paymentRoutes from './routes/payment.js';
import chambasRoutes from './routes/chambas.js';
import appointmentsRoutes from './routes/appointments.js';
import quotesRoutes from './routes/quotes.js';
import expensesRoutes from './routes/expenses.js';
import fiadoRoutes from './routes/fiado.js';
import shippingRoutes from './routes/shipping.js';
import clientFeaturesRoutes from './routes/client-features.js';
import announcementsRoutes from './routes/announcements.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

/* =========================
   CORS CONFIGURATION (FIX)
========================= */

const allowedOrigins = [
  'https://lapulperiastore.net',
  'https://lapulperiahn.shop',
  'http://localhost:5173'
];

/* =========================
   SOCKET.IO
========================= */

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* =========================
   MIDDLEWARES
========================= */

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Make io available in routes
app.set('io', io);

/* =========================
   RATE LIMITING
========================= */

// Rate limiting para rutas sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por ventana
  message: { error: { message: 'Demasiados intentos, intente de nuevo en 15 minutos' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: { error: { message: 'Demasiadas solicitudes, intente más tarde' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);

/* =========================
   ROUTES
========================= */

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pulperias', pulperiaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/business-hours', businessHoursRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/pulperia-services', pulperiaServicesRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/fiado', fiadoRoutes);
app.use('/api/chambas', chambasRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/client', clientFeaturesRoutes);
app.use('/api/announcements', announcementsRoutes);

/* =========================
   SOCKET AUTHENTICATION
========================= */

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const decodedToken = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, role: true },
    });

    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }

    socket.userId = user.id;
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
});

/* =========================
   SOCKET EVENTS
========================= */

io.on('connection', (socket) => {
  // Auto-join user's personal room for notifications
  socket.join(socket.userId);

  socket.on('join', (roomId) => {
    // Solo permitir unirse a su propio room
    if (roomId === socket.userId) {
      socket.join(roomId);
    }
  });

  socket.on('disconnect', () => {
    // Cleanup silencioso
  });
});

/* =========================
   ERROR HANDLING
========================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Ruta no encontrada' } });
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   La Pulpería Server                      ║
  ║   Running on http://localhost:${PORT}     ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});

export { io };
