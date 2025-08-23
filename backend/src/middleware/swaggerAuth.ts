import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../auth.js';

/**
 * Middleware to secure Swagger UI access
 * Only allows access to authenticated users with ADMIN role
 */
export function secureSwaggerUI(req: Request, res: Response, next: NextFunction) {
  // Check if it's a development environment
  if (process.env.NODE_ENV === 'development') {
    // Allow access in development
    return next();
  }

  // In production, require authentication
  return requireAuth(['ADMIN'])(req, res, next);
}

/**
 * Alternative: Basic authentication for Swagger UI
 * Useful for external API consumers
 */
export function basicAuthSwagger(req: Request, res: Response, next: NextFunction) {
  // Skip authentication in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API Documentation"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');

  // Check against environment variables
  const validUsername = process.env.SWAGGER_USERNAME;
  const validPassword = process.env.SWAGGER_PASSWORD;

  if (username === validUsername && password === validPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="API Documentation"');
  return res.status(401).json({ error: 'Invalid credentials' });
}

/**
 * IP-based access control for Swagger UI
 * Only allow access from specific IP addresses
 */
export function ipRestrictedSwagger(req: Request, res: Response, next: NextFunction) {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const allowedIPs = process.env.SWAGGER_ALLOWED_IPS?.split(',') || [];
  const clientIP = req.ip || req.connection.remoteAddress;

  if (allowedIPs.includes(clientIP) || allowedIPs.includes('*')) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Access denied',
    message: 'Swagger UI is not accessible from this IP address'
  });
}

/**
 * Combined security middleware for Swagger UI
 * Applies multiple security layers
 */
export function secureSwaggerAccess(req: Request, res: Response, next: NextFunction) {
  // Development: Allow access
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Production: Apply security measures
  const securityMode = process.env.SWAGGER_SECURITY_MODE || 'auth';

  switch (securityMode) {
    case 'auth':
      return secureSwaggerUI(req, res, next);
    case 'basic':
      return basicAuthSwagger(req, res, next);
    case 'ip':
      return ipRestrictedSwagger(req, res, next);
    case 'disabled':
      return res.status(404).json({ error: 'API documentation not available' });
    default:
      return secureSwaggerUI(req, res, next);
  }
}