# 🚀 lumpsum.in - Mutual Fund Learning & Advisory Platform

A production-grade, SEO-friendly Next.js + TypeScript monorepo for the world's most comprehensive mutual fund learning and advisory platform.

## 📁 Project Structure

```
lumpsum-1/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and configurations
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   ├── tests/               # Frontend tests
│   └── docs/                # Swagger documentation (copied from backend)
├── backend/                 # Express.js Backend API
│   ├── src/                 # Backend source code
│   ├── prisma/              # Database schema and migrations
│   ├── docs/                # API documentation
│   └── tests/               # Backend tests
├── package.json             # Root monorepo configuration
├── docker-compose.yml       # Multi-service Docker setup
├── Dockerfile               # Frontend Docker configuration
├── Dockerfile.backend       # Backend Docker configuration
└── vercel.json              # Vercel deployment configuration
```

## 🛠️ Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Authentication**: NextAuth.js
- **Testing**: Vitest + React Testing Library

### Backend (Express.js)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Prisma ORM + PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Infrastructure
- **Database**: PostgreSQL (production), SQLite (development)
- **Deployment**: Vercel (frontend), Railway/Render (backend)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18.0+
- npm or yarn
- PostgreSQL (for production)

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd lumpsum-1
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Create environment files
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. **Database Setup**
   ```bash
   # For development (SQLite)
   npm run db:push
   npm run db:seed:learning
   
   # For production (PostgreSQL)
   npm run db:migrate
   npm run db:seed:learning
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:4000
   ```

## 📚 Features

### 🎓 Mutual Fund University (Learning Hub)
- **Comprehensive Curriculum**: 50+ chapters from basics to advanced
- **Interactive Learning**: Quizzes, progress tracking, bookmarks
- **Personalized Experience**: Save progress, take notes, earn badges
- **Export Capabilities**: Generate PDF guides and notes

### 🧮 Advanced Calculators
- **Investment Calculators**: SIP, Lumpsum, Goal Planner, XIRR
- **Tax Calculators**: Income Tax, GST, Capital Gains
- **Retirement Planning**: NPS, PPF, FD, RD
- **Advanced Features**: Save results, share links, export PDF/CSV

### 📊 Portfolio Management
- **Portfolio Tracking**: Manual entry and CSV import
- **Asset Allocation**: Visual breakdown and recommendations
- **Performance Analysis**: XIRR calculations and historical data
- **Goal-based Planning**: Link investments to financial goals

### 🔍 Mutual Fund Explorer
- **Live NAV Data**: Real-time mutual fund information
- **Advanced Filters**: Category, rating, performance, risk
- **Comparison Tools**: Side-by-side fund analysis
- **Research Reports**: Detailed fund analysis and insights

### 👤 User Management
- **Authentication**: Google, GitHub, Email, Credentials
- **User Profiles**: Personal information and preferences
- **Investment Goals**: Goal setting and tracking
- **Calculation History**: Save and revisit past calculations

## 🏗️ Development Commands

### Root Level (Monorepo)
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run typecheck        # Type check all code
```

### Frontend Only
```bash
npm run dev:frontend     # Start frontend development server
npm run build:frontend   # Build frontend for production
npm run test:frontend    # Run frontend tests
npm run lint:frontend    # Lint frontend code
```

### Backend Only
```bash
npm run dev:backend      # Start backend development server
npm run build:backend    # Build backend for production
npm run test:backend     # Run backend tests
npm run db:push          # Push database schema changes
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with initial data
```

## 🐳 Docker Deployment

### Local Development with Docker
```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up frontend backend
docker-compose up postgres
```

### Production Deployment
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect repository to Railway/Render
2. Set environment variables
3. Configure build command: `npm run build:backend`
4. Configure start command: `npm run start:backend`

### Environment Variables

#### Frontend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-string
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PORT=4000
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test:frontend        # Run all frontend tests
npm run test:frontend:watch  # Run tests in watch mode
```

### Backend Tests
```bash
npm run test:backend         # Run all backend tests
npm run test:backend:watch   # Run tests in watch mode
```

### Test Coverage
- Frontend: Vitest with React Testing Library
- Backend: Jest with Supertest
- Target: 80%+ coverage for both

## 📖 API Documentation

### Swagger UI
- **Development**: http://localhost:4000/api/docs
- **Production**: https://your-backend-url.com/api/docs

### API Endpoints
- **Authentication**: `/api/auth/*`
- **User Management**: `/api/profile`, `/api/goals`
- **Calculators**: `/api/calc-history`
- **Learning Hub**: `/api/learning/*`
- **Mutual Funds**: `/api/funds`
- **Portfolio**: `/api/holdings`

## 🔧 Configuration

### Database
- **Development**: SQLite (file-based)
- **Production**: PostgreSQL (cloud-hosted)
- **Migrations**: Prisma migrations
- **Seeding**: Initial data and learning content

### Authentication
- **Providers**: Google, GitHub, Email, Credentials
- **Session**: JWT-based with refresh tokens
- **Security**: bcrypt password hashing, rate limiting

### Performance
- **Frontend**: Next.js optimization, code splitting
- **Backend**: Express middleware, connection pooling
- **Database**: Prisma query optimization, indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [API documentation](backend/docs/)

---

**Built with ❤️ for the Indian mutual fund community**
# CI Workflow Test
