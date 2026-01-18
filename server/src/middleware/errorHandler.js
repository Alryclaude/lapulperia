/**
 * Centralized Error Handler Middleware
 * Catches all errors passed via next(error) and returns consistent API responses.
 *
 * Handles:
 * - Prisma errors (unique constraint, not found, etc.)
 * - Validation errors (from Zod or custom)
 * - Custom AppErrors with status codes
 * - Generic server errors
 */

import { Prisma } from '@prisma/client';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, status = 500, code = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

/**
 * Pre-defined error factories
 */
export const Errors = {
  notFound: (resource = 'Recurso') =>
    new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND'),

  unauthorized: (message = 'No autorizado') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Acceso denegado') =>
    new AppError(message, 403, 'FORBIDDEN'),

  badRequest: (message = 'Solicitud inválida') =>
    new AppError(message, 400, 'BAD_REQUEST'),

  conflict: (message = 'Conflicto con datos existentes') =>
    new AppError(message, 409, 'CONFLICT'),

  tooMany: (message = 'Demasiadas solicitudes') =>
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),

  gone: (message = 'Recurso ya no disponible') =>
    new AppError(message, 410, 'GONE'),
};

/**
 * Map Prisma error codes to user-friendly messages
 */
const prismaErrorMessages = {
  P2002: 'Ya existe un registro con esos datos',
  P2003: 'Error de referencia: registro relacionado no existe',
  P2025: 'Registro no encontrado',
  P2014: 'La relación requerida no existe',
};

/**
 * Error Handler Middleware
 * Must be registered LAST in the middleware chain
 */
export const errorHandler = (err, req, res, next) => {
  // Log error with context
  const errorLog = {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
  };

  // Development: full stack trace
  // Production: minimal logging
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', errorLog);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${err.message}`);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const message = prismaErrorMessages[err.code] || 'Error de base de datos';
    const status = err.code === 'P2025' ? 404 : 400;

    return res.status(status).json({
      error: {
        message,
        code: err.code,
      },
    });
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: {
        message: 'Error de validación en la base de datos',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  // Handle Zod validation errors (if using Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: err.errors,
      },
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token inválido o expirado',
        code: 'INVALID_TOKEN',
      },
    });
  }

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: {
        message: 'Archivo demasiado grande',
        code: 'FILE_TOO_LARGE',
      },
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: {
        message: 'Tipo de archivo no permitido',
        code: 'INVALID_FILE_TYPE',
      },
    });
  }

  // Default: Internal Server Error
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    },
  });
};

/**
 * 404 Handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

export default errorHandler;
