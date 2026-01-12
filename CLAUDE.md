# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**La Pulperia** is a PWA marketplace connecting neighborhood stores (pulperias) with customers in Honduras. Store owners can digitize their business, manage products, receive real-time orders, and post job listings.

## Development Commands

```bash
# Full-stack development (both client and server)
npm run dev

# Individual services
npm run dev:client    # Frontend only (Vite on port 5173)
npm run dev:server    # Backend only (Express on port 10000)

# Install all dependencies
npm run install:all

# Build
npm run build         # Both client and server
npm run build:client  # Frontend only
npm run build:server  # Backend only (generates Prisma client)

# Database
npm run db:studio     # Open Prisma Studio
npm run db:migrate    # Deploy migrations
npm run db:push       # Push schema changes (dev)
```

## Architecture

### Monorepo Structure
- `client/` - React 18 + Vite frontend
- `server/` - Node.js + Express API

### Frontend (`client/src/`)
- **State Management**: Zustand stores in `stores/` for global state, React Query for server state
- **API Layer**: Services in `services/` wrap axios calls
- **UI Components**: shadcn/ui base components in `components/ui/`, custom components alongside
- **Routing**: React Router v6, pages in `pages/`, pulperia dashboard routes in `pages/pulperia/`

### Backend (`server/src/`)
- **Entry**: `index.js` - Express app with Socket.IO for real-time orders
- **Routes**: REST API endpoints in `routes/`
- **Auth**: Firebase Auth verification + JWT tokens via `middleware/auth.js`
- **File Uploads**: Multer + Cloudinary via `middleware/upload.js`
- **Database**: Prisma ORM with PostgreSQL, schema in `prisma/schema.prisma`

### Key Data Models
Two user roles exist: `CLIENT` (customers) and `PULPERIA` (store owners).
- `User` - Firebase-authenticated users
- `Pulperia` - Store profile linked 1:1 to User with PULPERIA role
- `Product` - Store inventory with Cloudinary images
- `Order` - Order lifecycle: PENDING → ACCEPTED → PREPARING → READY → DELIVERED

## Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Firebase Admin (for auth verification)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
```

**Important**: Server uses individual Cloudinary variables, NOT `CLOUDINARY_URL`.

### Frontend (`client/.env`)
```env
VITE_API_URL=https://your-api.onrender.com
# Firebase client config
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Design System

Dark theme with warm accents. Key Tailwind colors:
- `primary` (red `#DC2626`) - CTAs, buttons
- `accent`/`gold` (amber/gold) - stars, premium accents
- `dark` (purple-tinted black) - backgrounds

## Known Issues

1. **Cloudinary "Invalid Signature"**: Verify CLOUDINARY_* env vars are correctly set in Render
2. **API Route Mismatches**: Some frontend routes call non-existent backend endpoints (see `_agent_docs/`)
