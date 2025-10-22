# CreatorPulse - AI Newsletter Automation

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/OYlMcwS7qJR)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-black?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## Overview

CreatorPulse is an AI-powered newsletter automation platform that helps content creators:

- 📊 **Aggregate content** from Twitter, YouTube, Reddit, and custom sources
- 🤖 **Generate newsletters** using AI with personalized voice training
- ✍️ **Edit and refine** drafts with an intuitive editor
- 📈 **Track performance** with detailed analytics
- ⚡ **Automate workflows** with scheduled scraping and generation

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom dark theme
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Generative AI
- **Scraping**: Apify (optional)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- A Supabase account ([sign up here](https://supabase.com))
- Google Generative AI API key ([get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Creator_Pulse-main
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**

   Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):
   - Create a Supabase project
   - Run the database schema (`supabase-schema.sql`)
   - Get your API keys

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

### 🎯 Content Aggregation

Connect multiple content sources:
- Twitter accounts (latest tweets)
- YouTube channels (recent videos)
- Reddit subreddits (top posts)
- Custom URLs and RSS feeds

### 🤖 AI-Powered Generation

- **Voice Training**: Upload your writing samples to train a personalized AI voice
- **Smart Curation**: AI selects the most relevant content based on your preferences
- **Trend Detection**: Automatically identifies trending topics across sources
- **Draft Generation**: Creates newsletter drafts in your unique voice

### ✏️ Draft Editor

- Edit AI-generated content
- Provide feedback to improve future generations
- Schedule newsletters for optimal delivery times
- Track editing time and acceptance rates

### 📊 Analytics Dashboard

- Subscriber metrics
- Open and click-through rates
- Source performance
- Engagement trends
- Usage statistics

## Project Structure

```
Creator_Pulse-main/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (landing)/         # Landing page
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── sources/       # Source management
│   │   ├── drafts/        # Draft operations
│   │   └── dashboard/     # Analytics
│   ├── dashboard/         # Dashboard page
│   ├── drafts/            # Drafts management
│   ├── sources/           # Sources management
│   └── settings/          # User settings
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard widgets
│   ├── drafts/            # Draft editor components
│   └── landing/           # Landing page sections
├── lib/                   # Utilities
│   └── supabase/          # Supabase client setup
├── supabase-schema.sql    # Database schema
├── SUPABASE_SETUP.md      # Supabase setup guide
└── CLAUDE.md              # Claude Code guidance

```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/reset-password` - Password reset

### Sources
- `GET /api/sources` - List all sources
- `POST /api/sources` - Create new source
- `PATCH /api/sources/[id]` - Update source
- `DELETE /api/sources/[id]` - Delete source

### Drafts
- `GET /api/drafts` - Get recent drafts
- `POST /api/drafts` - Generate new draft
- `PATCH /api/drafts/[id]` - Update draft
- `DELETE /api/drafts/[id]` - Delete draft

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete schema documentation.

**Main Tables:**
- `users` - User profiles and preferences
- `sources` - Content sources
- `drafts` - Newsletter drafts
- `scraped_content` - Aggregated content
- `trends` - Trending topics
- `activity_feed` - User activity timeline

## Development

### Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality (errors ignored in build)
- Tailwind CSS for styling
- shadcn/ui for components

## Migration Notes

This project was migrated from Firebase to Supabase:
- Firebase Firestore → Supabase PostgreSQL
- Firebase Auth → Supabase Auth
- Firebase Cloud Functions → Next.js API Routes

See commit history for migration details.

## Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete Supabase setup instructions
- [Claude Code Guidance](./CLAUDE.md) - AI assistant development guidance
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation
- [Next.js Docs](https://nextjs.org/docs) - Official Next.js documentation

## License

This project was originally scaffolded with v0.app.

## Support

For issues or questions:
1. Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
2. Review Supabase project logs
3. Check browser console for errors