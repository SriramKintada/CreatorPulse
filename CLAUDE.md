# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CreatorPulse is an AI-powered newsletter automation platform built with Next.js 15 and Supabase. The application allows content creators to curate content from multiple sources (Twitter, YouTube, Reddit), generate AI-written newsletters using voice profiling, and manage their newsletter workflow.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system (indigo/purple theme)
- **UI Components**: Radix UI + shadcn/ui (New York style)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Generative AI
- **Package Manager**: pnpm (preferred - both pnpm-lock.yaml and package-lock.json exist, but use pnpm)

## Development Commands

### Initial Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables (see SUPABASE_SETUP.md)
cp .env.example .env.local

# Run the Supabase schema (via Supabase dashboard SQL Editor)
# See SUPABASE_SETUP.md for complete setup instructions
```

### Standard Commands
```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### API Routes (Next.js)

All backend logic is implemented as Next.js API routes in `app/api/`:
- **Auth**: `app/api/auth/*` (signup, login, logout, reset-password)
- **Sources**: `app/api/sources/*` (GET list, POST create, PATCH/DELETE by id)
- **Drafts**: `app/api/drafts/*` (GET list, POST generate, PATCH/DELETE by id)
- **Dashboard**: `app/api/dashboard/*` (GET stats)
- **Scrape**: `app/api/scrape` (POST manual trigger)

Each API route follows this pattern:
1. Create Supabase server client via `createClient()` from `@/lib/supabase/server`
2. Authenticate user with `supabase.auth.getUser()`
3. Validate request data
4. Perform database operations (RLS ensures data isolation)
5. Return JSON response with appropriate status codes

## Architecture

### Frontend Structure

The app uses Next.js 15 App Router with a route group-based layout system:

- **`app/`** - Next.js app directory
  - **`(landing)/`** - Public landing page (no main layout)
  - **`(auth)/`** - Authentication pages (login, signup) wrapped in MainLayout with centered content
  - Root level pages use MainLayout directly (dashboard, analytics, drafts, settings, sources, admin, onboarding)

- **`components/`** - React components
  - **`layout/`** - Layout components (MainLayout, Sidebar, TopNav, MobileNav)
  - **`ui/`** - Reusable UI primitives (shadcn/ui components)
  - **`dashboard/`**, **`drafts/`**, **`landing/`** - Feature-specific components

- **`lib/`** - Shared utilities
  - **`utils.ts`** - cn() utility for Tailwind class merging
  - **`hooks/`** - Custom React hooks (use-auth, use-sources, use-drafts, use-dashboard-stats, use-activity-feed)
  - **`scraping/`** - Web scraping integrations (Apify, Exa for RSS/semantic search)

### Layout System

The application uses a responsive layout with:
- `MainLayout` - Combines TopNav, Sidebar (desktop), and MobileNav (mobile)
- Desktop: Top navigation + left sidebar
- Mobile: Top navigation + bottom mobile navigation
- All authenticated pages wrap content in MainLayout

### Backend Structure (Supabase + Next.js API Routes)

API routes are organized by domain in `app/api/`:
- **`app/api/auth/`** - Authentication endpoints (signup, login, logout, reset-password)
- **`app/api/sources/`** - Content source management (CRUD operations)
- **`app/api/drafts/`** - Newsletter draft generation and editing
- **`app/api/dashboard/`** - Dashboard stats and analytics
- **`app/api/scrape/`** - Manual scraping triggers
- **`app/auth/callback/`** - OAuth callback handler for Supabase Auth

Supabase client utilities in `lib/supabase/`:
- **`client.ts`** - Browser client using `@supabase/ssr` for client components
- **`server.ts`** - Server client using `@supabase/ssr` for API routes and server components (handles cookies via Next.js cookies API)
- **`middleware.ts`** - Session management middleware (automatic token refresh)

Database schema and functions in `supabase-schema.sql`:
- Tables: users, sources, drafts, scraped_content, trends, activity_feed
- Row Level Security (RLS) policies for data isolation
- Database triggers for automatic timestamps and user profile creation
- Helper functions for usage counters

## Design System

### Color Scheme
The app uses a dark-first design with indigo/purple accents:
- Primary: `oklch(0.65 0.22 264)` - Indigo/purple
- Secondary: `oklch(0.55 0.2 280)` - Purple
- Accent: `oklch(0.7 0.25 264)` - Bright indigo
- Background: `oklch(0.12 0 0)` - Very dark
- Cards: `oklch(0.16 0 0)` - Slightly lighter dark

### Component Variants
- **Button**: default, secondary, accent, outline, ghost, destructive, link
- **Badge**: default, secondary, accent, outline, destructive, muted
- Most components include active scale animations (`active:scale-95`) and shadow effects

### Path Aliases
```typescript
@/*  -> ./  (covers all paths - @/components, @/lib, @/app, etc.)
```

Note: The hooks are located at `lib/hooks/`, not a separate `hooks/` directory at root.

## Custom Hooks Pattern

The application uses custom React hooks for data fetching and state management:

- **`use-auth.ts`** - Authentication state and user session
- **`use-sources.ts`** - Fetch and manage content sources
- **`use-drafts.ts`** - Fetch and manage newsletter drafts
- **`use-dashboard-stats.ts`** - Fetch dashboard statistics
- **`use-activity-feed.ts`** - Fetch user activity timeline

These hooks abstract API calls and provide:
- Loading states
- Error handling
- Data caching (via React state)
- Reusable data fetching logic across components

## Authentication & Authorization

**Client-side Authentication:**
- Use `createClient()` from `@/lib/supabase/client` for browser/client components
- Session is stored in cookies (managed by `@supabase/ssr`)

**Server-side Authentication:**
- Use `createClient()` from `@/lib/supabase/server` for API routes and server components
- Reads session from cookies using Next.js `cookies()` API
- Always check `await supabase.auth.getUser()` before performing operations

**Row Level Security (RLS):**
- All tables have RLS policies enforcing `user_id` checks
- Users can only access their own data
- Service role key bypasses RLS (use cautiously, only for admin operations)

## Supabase Database Schema

**Main Tables:**

1. **users** - User profiles (linked to auth.users via trigger)
   - Preferences, voice profile, usage metrics
   - Created automatically on signup

2. **sources** - Content sources (Twitter, YouTube, Reddit, etc.)
   - Type-specific configurations stored as JSONB
   - Scrape frequency and status tracking
   - Supported types: `twitter`, `youtube`, `reddit`, `newsletter_rss`, `custom_url`

3. **drafts** - Newsletter drafts
   - AI-generated content (title, body, curated items, trends)
   - User edits and feedback
   - Performance metrics (open rate, click rate)

4. **scraped_content** - Scraped content items
   - Links to sources via foreign key
   - AI processing (topics, keywords, sentiment, relevance score)
   - Engagement metrics from source platform

5. **trends** - Global trending topics
   - Read-only for authenticated users
   - Time-windowed mention counts

6. **activity_feed** - User activity timeline

**Key Features:**
- Row Level Security (RLS) enforces data isolation
- Automatic user profile creation via database trigger
- Usage counters via helper function `increment_user_usage()`
- Automatic timestamp updates via triggers

## Key Features

1. **Multi-source Content Aggregation**: Scrape and curate content from Twitter, YouTube, Reddit using Apify actors
2. **AI Newsletter Generation**: Generate drafts using Google Generative AI with voice profiling
3. **Draft Editor**: Manual editing and refinement of AI-generated content
4. **Analytics Dashboard**: Track subscribers, open rates, clicks, engagement
5. **Voice Training**: Upload writing samples to train personalized voice profiles
6. **Scheduled Jobs**: Automated scraping, trend detection, and draft generation
7. **Admin Panel**: User management, system monitoring, manual scrape triggers

### Data Flow

1. **Source Creation**: User adds a source (Twitter, YouTube, Reddit, RSS, custom URL) via `POST /api/sources`
2. **Content Scraping**:
   - Apify actors scrape content from sources (Twitter Scraper, YouTube Scraper, etc.)
   - Exa.ai for RSS feeds and semantic search
   - Stored in `scraped_content` table with metadata (topics, keywords, sentiment, relevance score)
3. **Draft Generation**:
   - User triggers draft generation via `POST /api/drafts`
   - AI analyzes scraped content and user's voice profile
   - Generates newsletter with curated items and trending topics
   - Stored in `drafts` table
4. **Draft Editing**: User edits draft in Draft Editor, provides feedback to improve future generations
5. **Activity Tracking**: All actions logged to `activity_feed` for timeline view

## Important Notes

- **Build Configuration**: TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- **Images**: Images are unoptimized (`unoptimized: true`)
- **Dark Mode**: App is dark-first with `className="dark"` on `<html>` element
- **Analytics**: Vercel Analytics is integrated
- **Originally created with v0.app**: This project was scaffolded from v0.app and syncs with deployments
- **Database Migration**: Project migrated from Firebase to Supabase

## Environment Variables

Required environment variables (defined in `.env.local`):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google AI (Required for draft generation)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key

# Scraping Services (Optional)
APIFY_API_TOKEN=your-apify-token     # For Twitter, YouTube, Reddit scraping
EXA_API_KEY=your-exa-api-key         # For RSS feeds and semantic search
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-side only.

## Setup Instructions

See `SUPABASE_SETUP.md` for detailed setup instructions including:
1. Creating a Supabase project
2. Getting API keys
3. Running the database schema
4. Configuring environment variables
5. Testing authentication

Quick setup flow:
```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local with your keys
# 4. Run schema in Supabase SQL Editor (see SUPABASE_SETUP.md)
# 5. Start dev server
pnpm dev
```

## API Testing

Test the authentication endpoints:
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```
- dont ask to start npm run dev, its already done at the beginning