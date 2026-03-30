# Smart Hostel Management - Frontend

Next.js frontend for the Smart Hostel Management System.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI + Vaul
- **Real-time**: Socket.io Client
- **Charts**: Recharts
- **Animations**: Framer Motion + Tw Animate CSS
- **Date Handling**: date-fns

## Installation

```bash
# Install dependencies
npm install
```

## Environment Setup

```bash
# Copy environment file
cp .env.local.example .env.local
```

### Required Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Development

```bash
# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── issues/
│   │   ├── announcements/
│   │   ├── lost-found/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                    # Base UI components
│   ├── shared/                # Shared components
│   ├── issues/                # Issue-related components
│   ├── announcements/         # Announcement components
│   └── layout/                # Layout components
│
├── store/                     # Zustand stores
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── lib/
│   ├── api.ts                 # API client
│   ├── axios.ts               # Axios instance
│   ├── socket.ts              # Socket.io client
│   ├── utils.ts               # Utility functions
│   └── cn.ts                  # ClassName utility
│
├── types/                     # TypeScript types
│   ├── api.types.ts
│   └── index.ts
│
└── constants/                 # App constants
```

## Features

### Authentication
- User registration with email verification
- Login with email/password
- Google OAuth integration
- Password reset functionality
- Protected routes with role-based access

### Dashboard
- Overview statistics
- Recent issues
- Quick actions
- Announcements preview

### Issue Management
- Create new issues with images
- View issue list with filters
- Track issue status
- Add comments
- View issue history

### Announcements
- View announcements by category
- Mark as read
- Priority announcements highlight
- Filter by hostel/block/role

### Lost & Found
- Report lost items
- Post found items
- Claim items
- Track claim status

### Analytics
- Issue statistics
- Category breakdown
- Resolution time metrics
- Visual charts

### Profile & Settings
- Update profile information
- Change password
- Notification preferences

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/register` | Registration page |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/dashboard` | Main dashboard |
| `/issues` | Issues list |
| `/issues/new` | Create new issue |
| `/issues/[id]` | Issue details |
| `/announcements` | Announcements list |
| `/announcements/[id]` | Announcement details |
| `/lost-found` | Lost & Found items |
| `/analytics` | Analytics dashboard |
| `/notifications` | Notification center |
| `/profile` | User profile |
| `/settings` | Settings page |

## State Management

### Auth Store (Zustand)
```typescript
// Stores user authentication state
- user: User | null
- isAuthenticated: boolean
- login(credentials)
- register(data)
- logout()
- updateUser(data)
```

### React Query
- Used for server state management
- Automatic caching and refetching
- Optimistic updates

## API Integration

API calls are made through a centralized Axios instance with:
- Request/response interceptors
- Automatic token refresh
- Error handling
- Loading states

## UI Components

Built with Radix UI primitives:
- Dialog
- Dropdown Menu
- Select
- Toast/Sonner
- Alert Dialog
- Checkbox
- Radio Group
- Label
- Sheet (Vaul)

## Real-time

Socket.io integration for:
- New notifications
- Issue updates
- Announcement broadcasts

## License

ISC
