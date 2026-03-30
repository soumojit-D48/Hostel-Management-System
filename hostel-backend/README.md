# Smart Hostel Management - Backend

RESTful API backend for the Smart Hostel Management System built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+ with ioredis
- **Authentication**: Passport.js (Local + JWT + Google OAuth)
- **File Storage**: Cloudinary with Sharp for image processing
- **Real-time**: Socket.io with Redis adapter
- **Validation**: Zod
- **Task Queue**: BullMQ
- **Logging**: Winston
- **Email**: Nodemailer

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

## Installation

```bash
# Install dependencies
npm install
```

## Environment Setup

```bash
# Copy environment file
cp .env.example .env
```

### Required Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Development

```bash
# Start development server with hot reload
npm run dev
```

Server runs on `http://localhost:5000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run typecheck` | Check TypeScript compilation |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
src/
├── config/
│   ├── index.ts          # Configuration loader
│   └── passport.ts       # Passport strategies
│
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── issues/
│   │   ├── issues.routes.ts
│   │   ├── issues.controller.ts
│   │   ├── issues.service.ts
│   │   └── issues.validation.ts
│   ├── announcements/
│   ├── lost-found/
│   ├── notifications/
│   ├── analytics/
│   ├── users/
│   ├── hostels/
│   └── blocks/
│
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── rate-limiter.middleware.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   ├── cloudinary.service.ts
│   │   ├── redis.service.ts
│   │   └── socket.service.ts
│   └── utils/
│       ├── ApiError.ts
│       ├── catchAsync.ts
│       └── helpers.ts
│
├── app.ts               # Express app configuration
├── server.ts            # Server startup
└── routes.ts            # Route aggregator
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/google` - Google OAuth redirect
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update current user
- `PATCH /api/v1/users/me/avatar` - Upload avatar

### Issues
- `GET /api/v1/issues` - List issues (with filters)
- `POST /api/v1/issues` - Create issue
- `GET /api/v1/issues/:id` - Get issue details
- `PATCH /api/v1/issues/:id` - Update issue
- `PATCH /api/v1/issues/:id/status` - Update issue status
- `DELETE /api/v1/issues/:id` - Delete issue
- `POST /api/v1/issues/:id/comments` - Add comment
- `POST /api/v1/issues/:id/images` - Upload images

### Announcements
- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement
- `GET /api/v1/announcements/:id` - Get announcement
- `PATCH /api/v1/announcements/:id` - Update announcement
- `DELETE /api/v1/announcements/:id` - Delete announcement
- `POST /api/v1/announcements/:id/read` - Mark as read

### Lost & Found
- `GET /api/v1/lost-found` - List items
- `POST /api/v1/lost-found` - Create item
- `GET /api/v1/lost-found/:id` - Get item
- `PATCH /api/v1/lost-found/:id` - Update item
- `DELETE /api/v1/lost-found/:id` - Delete item
- `POST /api/v1/lost-found/:id/claim` - Claim item
- `POST /api/v1/lost-found/:id/verify` - Verify claim

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard statistics
- `GET /api/v1/analytics/issues` - Issue analytics
- `GET /api/v1/analytics/announcements` - Announcement analytics

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/read-all` - Mark all as read

### Hostels & Blocks
- `GET /api/v1/hostels` - List hostels
- `GET /api/v1/hostels/:id` - Get hostel details
- `GET /api/v1/blocks` - List blocks
- `GET /api/v1/blocks/:id` - Get block details

## User Roles

| Role | Description |
|------|-------------|
| STUDENT | Report issues, view announcements, lost & found |
| STAFF | View and resolve assigned issues |
| MANAGEMENT | Full access to all features |

## Real-time Events

Socket.io events for real-time updates:

- `notification:new` - New notification received
- `issue:new` - New issue created
- `issue:updated` - Issue status updated
- `announcement:new` - New announcement posted

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## License

ISC
