# FirstMove Web Application - Complete Source Code Export

## Project Structure
```
firstmove-web-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── contexts/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── push-service.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── public/
│   ├── sw.js
│   └── icon-192.png
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
└── components.json
```

## Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up database:**
- PostgreSQL database required
- Set DATABASE_URL environment variable

3. **Push database schema:**
```bash
npm run db:push
```

4. **Start development server:**
```bash
npm run dev
```

## Core Features

### Authentication System
- User registration and login
- Session management with PostgreSQL storage
- Password hashing with bcrypt

### Partner Pairing
- Secure 6-digit pairing codes
- Code generation and validation
- Couple creation and activation

### Mood Matching
- Duration-based mood setting (30min, 1hr, 2hr)
- Real-time match detection
- Automatic mood expiration

### Real-time Communication
- WebSocket connections for instant notifications
- Match alerts when both partners set mood
- Connection status updates

### Push Notifications
- Browser push notifications
- Service worker implementation
- Match and connection alerts

### Privacy Controls
- Optional connection tracking
- Data deletion options
- History clearing functionality

### Responsive UI
- Mobile-first design
- Dark mode support
- Tailwind CSS styling
- shadcn/ui components

## Key Dependencies

### Backend
- Express.js server
- PostgreSQL with Neon serverless
- Drizzle ORM
- WebSocket (ws)
- bcrypt for password hashing
- express-session for authentication

### Frontend
- React 18 with TypeScript
- Vite build tool
- TanStack Query for data fetching
- Wouter for routing
- Tailwind CSS for styling
- Framer Motion for animations

### Database
- PostgreSQL tables: users, couples, moods, matches, push_subscriptions
- Foreign key relationships
- Indexes for performance

## Production Deployment

The application is configured for production deployment with:
- Vite static file serving
- PostgreSQL connection pooling
- Environment variable configuration
- Error handling and logging

## API Endpoints

### Authentication
- POST /api/login
- POST /api/register
- GET /api/user/:id

### Pairing
- POST /api/pairing/generate
- POST /api/pairing/join
- GET /api/user/:id/couple

### Mood Management
- POST /api/mood
- DELETE /api/user/:id/mood
- GET /api/user/:id/moods

### Match System
- GET /api/couple/:id/matches
- POST /api/match/:id/connect

### Settings
- PATCH /api/user/:id/keep-track
- DELETE /api/user/:id/history

### Push Notifications
- POST /api/push/subscribe
- DELETE /api/push/unsubscribe

## Database Schema

### Users Table
- id (primary key)
- username (unique)
- password (hashed)
- displayName
- keepTrack (boolean)
- timestamps

### Couples Table
- id (primary key)
- user1Id, user2Id (foreign keys)
- pairingCode
- isActive (boolean)
- timestamps

### Moods Table
- id (primary key)
- userId (foreign key)
- duration (minutes)
- expiresAt
- timestamps

### Matches Table
- id (primary key)
- coupleId (foreign key)
- acknowledged, connected (booleans)
- timestamps

### Push Subscriptions Table
- id (primary key)
- userId (foreign key)
- endpoint, keys
- timestamps

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Input validation with Zod
- Secure WebSocket connections
- Environment variable protection

This is your complete, working FirstMove web application with all features functioning correctly.