import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Enhanced CORS configuration
 */
export function configureCORS() {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'https://lumpsum.in',
    'https://www.lumpsum.in',
    'https://lumpsum-in.vercel.app'
  ];

  // Add development origins
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
  }

  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  });
}

/**
 * Enhanced rate limiting configuration
 */
export function configureRateLimiting() {
  // Authentication rate limiting (stricter)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      error: 'Too many login attempts',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  });

  // API rate limiting (moderate)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Strict rate limiting for sensitive endpoints
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Public endpoints (more lenient)
  const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  return {
    authLimiter,
    apiLimiter,
    strictLimiter,
    publicLimiter
  };
}

/**
 * Enhanced security headers configuration
 */
export function configureSecurityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, ip, userAgent } = req;

  // Log request start
  console.log(`[${new Date().toISOString()}] ${method} ${path} - ${ip} - ${userAgent}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Log security events
    if (statusCode === 401 || statusCode === 403) {
      console.warn(`[SECURITY] ${method} ${path} - ${statusCode} - ${ip} - ${duration}ms`);
    } else {
      console.log(`[${new Date().toISOString()}] ${method} ${path} - ${statusCode} - ${duration}ms`);
    }
  });

  next();
}

/**
 * Security event monitoring middleware
 */
export function securityMonitor(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, ip, userAgent, headers } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Monitor for suspicious activity
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /eval\(/i, // Code injection
      /javascript:/i // JavaScript injection
    ];

    const requestString = `${method} ${path} ${JSON.stringify(headers)}`;
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

    if (isSuspicious || statusCode === 401 || statusCode === 403) {
      console.error(`[SECURITY ALERT] Suspicious request detected:`, {
        timestamp: new Date().toISOString(),
        method,
        path,
        ip,
        userAgent,
        statusCode,
        duration,
        suspicious: isSuspicious
      });
    }
  });

  next();
}

/**
 * API key validation middleware
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  // Skip validation for internal routes
  if (req.path.startsWith('/auth/') || req.path.startsWith('/health')) {
    return next();
  }

  // Check if API key is required for this endpoint
  const requiresApiKey = process.env.REQUIRE_API_KEY === 'true';
  
  if (requiresApiKey && !apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header'
    });
  }

  if (apiKey) {
    // Validate API key (implement your validation logic here)
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }
  }

  next();
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  // Log error details
  console.error(`[ERROR] ${req.method} ${req.path} - ${statusCode} - ${message}`, {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: err.stack
  });

  // Don't expose internal errors in production
  const responseMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : message;

  res.status(statusCode).json({ 
    error: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Health check endpoint
 */
export function healthCheck(req: Request, res: Response) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
}