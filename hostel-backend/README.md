# Smart Hostel Management Backend

RESTful API backend for Smart Hostel Issue Tracking System built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5.3+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+
- **Authentication**: Passport.js (Local + Google OAuth)
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Validation**: Zod

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Fill in your credentials in .env
   ```

3. **Database setup**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:studio  # Optional: View database
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript compilation

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api/v1` - API information

### Authentication (Coming Soon)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/google` - Google OAuth
- `POST /api/v1/auth/logout` - User logout

### Issues (Coming Soon)
- `GET /api/v1/issues` - List issues
- `POST /api/v1/issues` - Create issue
- `GET /api/v1/issues/:id` - Get issue details
- `PATCH /api/v1/issues/:id/status` - Update issue status

## Project Structure

```
src/
├── config/           # Configuration files
├── modules/          # Feature modules (auth, issues, etc.)
├── shared/           # Shared utilities and middleware
│   ├── middleware/   # Express middleware
│   ├── services/     # Utility services
│   └── utils/        # Helper functions
├── jobs/             # Background job definitions
├── app.ts            # Express app configuration
├── server.ts         # Server startup logic
└── routes.ts         # Main route aggregator
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `CLOUDINARY_*` - Cloudinary credentials
- `GOOGLE_*` - Google OAuth credentials

## Development

The backend follows modular monolith architecture with clear separation of concerns. Each feature module contains its own routes, controllers, services, and validation schemas.

## Health Check

Server health can be monitored at:
```bash
curl http://localhost:5000/health
```

## License

ISC