# 🔐 API Documentation & Security Analysis

## 📋 Available APIs

### **Backend APIs (Express.js)**

#### **Authentication Endpoints**
```
POST /auth/login
POST /auth/refresh
GET  /me
```

#### **User Management**
```
GET  /api/profile
PUT  /api/profile
```

#### **Investment Goals**
```
GET  /api/goals
POST /api/goals
PUT  /api/goals
DELETE /api/goals
```

#### **Portfolio Holdings**
```
GET  /api/holdings
POST /api/holdings
PUT  /api/holdings
DELETE /api/holdings
```

#### **Mutual Funds**
```
GET  /api/funds
GET  /api/funds/{id}
GET  /api/funds/search
GET  /api/funds/categories
```

#### **Learning Hub**
```
GET  /learning/chapters
GET  /learning/chapters/{id}
POST /learning/progress
GET  /learning/bookmarks
POST /learning/bookmarks
DELETE /learning/bookmarks/{id}
POST /learning/quiz/{quizId}/answer
GET  /learning/badges
```

#### **Calculations**
```
GET  /calc-history
POST /calc-history
```

#### **Investor Guides**
```
GET  /investor/guides
POST /investor/guide
```

### **Frontend APIs (Next.js API Routes)**

#### **Authentication**
```
/api/auth/signin
/api/auth/signup
/api/auth/signout
/api/auth/callback/google
/api/auth/callback/github
```

#### **User Management**
```
GET  /api/profile
PUT  /api/profile
```

#### **Investment Data**
```
GET  /api/goals
POST /api/goals
PUT  /api/goals
DELETE /api/goals

GET  /api/holdings
POST /api/holdings
PUT  /api/holdings
DELETE /api/holdings
```

#### **Fund Data**
```
GET  /api/funds
GET  /api/funds/search
GET  /api/funds/categories
```

#### **Learning**
```
GET  /api/learning/chapters
GET  /api/learning/progress
POST /api/learning/progress
```

#### **Health & Documentation**
```
GET  /api/health
GET  /api/docs
```

## 🔍 Swagger Documentation Access

### **Current Swagger Setup**

#### **Backend Swagger UI**
- **URL**: `http://localhost:4000/docs`
- **Status**: ✅ Available
- **Security**: ❌ **PUBLICLY ACCESSIBLE** (Security Issue)

#### **Frontend API Documentation**
- **URL**: `http://localhost:3000/api/docs`
- **Status**: ✅ Available
- **Security**: ❌ **PUBLICLY ACCESSIBLE** (Security Issue)

### **Swagger Configuration**

```typescript
// Backend Swagger Setup (backend/src/app.ts)
try {
  const require = createRequire(import.meta.url);
  const swagger = require("../../docs/swagger.json");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger as any));
} catch {
  // noop in test environments where docs may be unavailable
}
```

## 🚨 Security Analysis

### **Current Security Issues**

#### **1. Public Swagger Documentation** ❌
**Issue**: Swagger UI is publicly accessible without authentication
**Risk**: High - Exposes API structure and endpoints
**Impact**: 
- API endpoint enumeration
- Potential attack vector identification
- Internal system information disclosure

#### **2. CORS Configuration** ⚠️
**Current Setup**:
```typescript
app.use(cors({ origin: true, credentials: true }));
```
**Issue**: Allows requests from any origin in development
**Risk**: Medium - Could allow unauthorized cross-origin requests

#### **3. Rate Limiting** ✅
**Current Setup**:
```typescript
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
```
**Status**: ✅ Properly configured
- 200 requests per 15 minutes
- Reasonable for most use cases

#### **4. Security Headers** ✅
**Current Setup**:
```typescript
app.use(helmet());
```
**Status**: ✅ Properly configured
- Includes security headers
- XSS protection
- Content Security Policy

#### **5. Authentication** ✅
**Current Setup**:
- JWT-based authentication
- Role-based access control
- Refresh token rotation
- Password hashing with bcrypt

### **Security Recommendations**

#### **1. Secure Swagger Documentation**

```typescript
// Add authentication to Swagger UI
app.use("/docs", 
  requireAuth(["ADMIN"]), // Only allow admins
  swaggerUi.serve, 
  swaggerUi.setup(swagger, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "lumpsum.in API Documentation"
  })
);

// Alternative: Environment-based access
if (process.env.NODE_ENV === 'development') {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));
} else {
  app.use("/docs", requireAuth(["ADMIN"]), swaggerUi.serve, swaggerUi.setup(swagger));
}
```

#### **2. Enhanced CORS Configuration**

```typescript
// Production CORS configuration
const allowedOrigins = [
  'https://lumpsum.in',
  'https://www.lumpsum.in',
  'https://lumpsum-in.vercel.app'
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### **3. Enhanced Rate Limiting**

```typescript
// Different rate limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 requests per window
  message: 'Too many requests from this IP'
});

// Apply different limits to different routes
app.use('/auth/login', authLimiter);
app.use('/api/', apiLimiter);
app.use('/calc-history', strictLimiter);
```

#### **4. Input Validation**

```typescript
import { z } from 'zod';

// Define validation schemas
const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  timeHorizon: z.number().min(1).max(50),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  goalType: z.enum(['EDUCATION', 'RETIREMENT', 'HOUSE', 'OTHER'])
});

// Apply validation middleware
app.post('/api/goals', 
  requireAuth(['USER', 'ADMIN']),
  validateBody(createGoalSchema),
  async (req, res) => {
    // Handler logic
  }
);

function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
  };
}
```

#### **5. API Key Authentication for External Access**

```typescript
// API key middleware for external integrations
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key against database
  const validKey = await validateApiKey(apiKey);
  if (!validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}

// Apply to external endpoints
app.get('/api/public/funds', requireApiKey, async (req, res) => {
  // Public fund data endpoint
});
```

#### **6. Request Logging and Monitoring**

```typescript
import morgan from 'morgan';

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

// Security event logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn('Security event', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        duration
      });
    }
  });
  
  next();
});
```

## 🔧 Implementation Plan

### **Phase 1: Immediate Security Fixes (This Week)**

1. **Secure Swagger Documentation**
   ```bash
   # Add authentication to Swagger UI
   npm install swagger-ui-express
   ```

2. **Update CORS Configuration**
   ```bash
   # Update environment variables
   CORS_ORIGINS=https://lumpsum.in,https://www.lumpsum.in
   ```

3. **Add Input Validation**
   ```bash
   # Install validation library
   npm install zod
   ```

### **Phase 2: Enhanced Security (Next Week)**

1. **API Key Management**
   - Create API key generation system
   - Add API key validation
   - Implement rate limiting per API key

2. **Enhanced Monitoring**
   - Add security event logging
   - Implement alerting system
   - Add request/response monitoring

3. **Security Headers Enhancement**
   - Add Content Security Policy
   - Implement HSTS
   - Add Referrer Policy

### **Phase 3: Advanced Security (Following Week)**

1. **OAuth 2.0 Implementation**
   - Add OAuth 2.0 for third-party integrations
   - Implement scope-based access control
   - Add token introspection

2. **Audit Logging**
   - Comprehensive audit trail
   - Data access logging
   - Change tracking

3. **Penetration Testing**
   - Security assessment
   - Vulnerability scanning
   - Code security review

## 📊 Security Checklist

### **Authentication & Authorization**
- [x] JWT-based authentication
- [x] Role-based access control
- [x] Password hashing (bcrypt)
- [x] Refresh token rotation
- [ ] API key management
- [ ] OAuth 2.0 implementation

### **API Security**
- [x] Rate limiting
- [x] Security headers (Helmet)
- [ ] Input validation
- [ ] Output sanitization
- [ ] Request logging
- [ ] Error handling

### **Documentation Security**
- [ ] Swagger UI authentication
- [ ] Environment-based access control
- [ ] API documentation versioning
- [ ] Access logging

### **Infrastructure Security**
- [x] CORS configuration
- [ ] HTTPS enforcement
- [ ] Environment variable security
- [ ] Database connection security
- [ ] File upload security

### **Monitoring & Alerting**
- [ ] Security event logging
- [ ] Anomaly detection
- [ ] Alert system
- [ ] Performance monitoring
- [ ] Error tracking

## 🎯 Next Steps

### **Immediate Actions**
1. **Secure Swagger UI** - Add authentication immediately
2. **Update CORS** - Restrict origins to production domains
3. **Add Input Validation** - Implement Zod schemas
4. **Review Environment Variables** - Ensure sensitive data is protected

### **Short-term Goals**
1. Implement API key management
2. Add comprehensive logging
3. Set up security monitoring
4. Conduct security audit

### **Long-term Vision**
1. OAuth 2.0 implementation
2. Advanced threat detection
3. Automated security testing
4. Compliance certification

This security analysis and implementation plan will ensure that lumpsum.in APIs are properly secured and protected against common security threats while maintaining accessibility for legitimate users.