# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wedding RSVP System built with React frontend (Vite) and Convex backend. Guests use unique family codes to RSVP, and there's an admin panel for managing families and guests. The app is deployed to GitHub Pages.

## Essential Commands

### Development
```bash
npm run dev                # Start both frontend and backend servers
npm run dev:frontend       # Start only the frontend (Vite dev server)
npm run dev:backend        # Start only the backend (Convex dev)
```

### Building & Linting
```bash
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # TypeScript check for both frontend and backend + Convex validation
```

### Deployment
```bash
npm run deploy             # Deploy to GitHub Pages (runs build first)
```

## Architecture

### Frontend (React + Vite)
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Routing**: State-based routing with `currentStep` ('welcome' | 'selection' | 'thankyou' | 'admin')
- **Components**: Located in `src/components/`
  - `WelcomePage` - Family code entry and guest display
  - `SelectionPage` - RSVP selection (attendance + dietary restrictions)
  - `ThankYouPage` - Confirmation page
  - `AdminPanel` - Admin interface for managing families/guests
- **Authentication**: Uses Convex Auth with anonymous auth
- **Styling**: Tailwind CSS with rose/pink theme
- **Base URL**: Configured for `/RSVP/` path (GitHub Pages deployment)

### Backend (Convex)
- **Schema**: `convex/schema.ts` defines database tables
  - `families` - Family groups with unique codes, indexed by `uniqueCode`
  - `guests` - Individual guests linked to families, indexed by `familyId`
  - `weddingDetails` - Wedding ceremony information
- **API Functions**: Split across files in `convex/` directory
  - `convex/families.ts` - Family management functions
  - `convex/wedding.ts` - Wedding details functions
  - `convex/auth.ts` - Authentication functions
- **HTTP Routes**: Custom routes in `convex/router.ts` (separate from auth routes in `convex/http.ts`)

### Key Data Flow
1. Guest enters family code → validates against `families.uniqueCode`
2. System displays family members from `guests` table
3. Guest selects attendance/dietary info → updates `guests.willAttend` and `guests.dietaryRestrictions`
4. System marks `families.rsvpSubmitted = true` and sets `rsvpSubmittedAt`

## Important Convex Patterns

This project follows Convex best practices as defined in `.cursor/rules/convex_rules.mdc`:

### Function Syntax
- Always use new function syntax with `args`, `returns`, and `handler`
- Include validators for all arguments and return values
- Use `v.null()` for functions that don't return anything

### Function Types
- `query` - Read data (public API)
- `mutation` - Write data (public API) 
- `internalQuery`/`internalMutation` - Private functions
- `action` - External API calls, file operations (runs in Node.js)

### Database
- Use indexes for queries instead of `filter()`
- Follow naming pattern: "by_field1_and_field2" for indexes
- Use `ctx.db.get()` for single documents by ID
- Use `withIndex()` for efficient queries

## URL Parameters
- `?family=CODE` - Direct link to RSVP with family code
- `?admin=true` - Access admin panel (requires authentication)