# Supabase Setup Guide for CreatorPulse

This guide will walk you through setting up Supabase for the CreatorPulse application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed
- pnpm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: CreatorPulse (or your preferred name)
   - Database Password: (create a strong password)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon)
2. Go to "API" in the sidebar
3. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Also configure other required environment variables:
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Get from https://makersuite.google.com/app/apikey
   - `APIFY_API_KEY`: (Optional) Get from https://console.apify.com/account/integrations

## Step 4: Run the Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the sidebar
2. Click "New Query"
3. Open `supabase-schema.sql` from this repository
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click "Run" or press `Ctrl+Enter`
7. Wait for the query to complete successfully

The schema will create:
- All necessary tables (users, sources, drafts, scraped_content, trends, activity_feed)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Helper functions

## Step 5: Verify the Setup

1. In Supabase dashboard, go to "Table Editor"
2. You should see the following tables:
   - `users`
   - `sources`
   - `drafts`
   - `scraped_content`
   - `trends`
   - `activity_feed`

3. Go to "Authentication" > "Policies"
4. Verify that RLS is enabled for all tables

## Step 6: Install Dependencies

```bash
pnpm install
```

This will install:
- `@supabase/supabase-js`: Supabase JavaScript client
- `@supabase/ssr`: Supabase SSR utilities for Next.js
- All other project dependencies

## Step 7: Run the Development Server

```bash
pnpm dev
```

The application will be available at http://localhost:3000

## Step 8: Test Authentication

1. Go to http://localhost:3000/sign-up
2. Create a test account
3. Check the Supabase dashboard under "Authentication" > "Users"
4. You should see your new user
5. Check "Table Editor" > "users" - you should see a profile automatically created

## Architecture Overview

### Authentication Flow

- **Sign Up**: POST to `/api/auth/signup`
  - Creates auth user in Supabase Auth
  - Automatically creates user profile via database trigger

- **Login**: POST to `/api/auth/login`
  - Uses Supabase Auth
  - Sets secure HTTP-only cookies

- **Logout**: POST to `/api/auth/logout`
  - Clears auth session

### API Routes

All Firebase Functions have been migrated to Next.js API routes:

- **Auth**: `/api/auth/*`
- **Sources**: `/api/sources`, `/api/sources/[id]`
- **Drafts**: `/api/drafts`, `/api/drafts/[id]`
- **Dashboard**: `/api/dashboard/stats`

### Database Schema

**Main Tables:**

1. **users** - User profiles and settings
   - Automatically created on auth signup via trigger
   - Stores preferences, voice profile, usage metrics

2. **sources** - Content sources (Twitter, YouTube, Reddit, etc.)
   - Foreign key to users table
   - RLS policies ensure users only see their own sources

3. **drafts** - Newsletter drafts
   - AI-generated content + user edits
   - Performance metrics tracking

4. **scraped_content** - Content scraped from sources
   - Links to source_id
   - AI processing results (topics, keywords, sentiment, relevance)

5. **trends** - Trending topics detected across all content
   - Global table (read-only for users)

6. **activity_feed** - User activity timeline

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Service role key required for admin operations
- Automatic session refresh via middleware

## Common Issues & Solutions

### Issue: "relation 'public.users' already exists"

**Solution**: The schema has already been run. You can either:
- Skip the schema creation step, or
- Drop existing tables and re-run the schema

### Issue: "Invalid JWT"

**Solution**:
- Make sure your environment variables are correct
- Clear your browser cookies and try logging in again
- Restart the development server

### Issue: "User profile not created on signup"

**Solution**:
- Check that the `on_auth_user_created` trigger exists
- Verify the trigger function `handle_new_user()` is present
- Check Supabase logs for errors

### Issue: RLS policies preventing data access

**Solution**:
- Verify the user is authenticated
- Check that RLS policies match the query patterns in the API routes
- Use the Supabase SQL Editor to test queries manually

## Next Steps

1. **Configure Email Provider**: Set up email templates in Supabase for password reset, etc.
2. **Set up Scheduled Jobs**: Use Supabase Edge Functions or a cron service for scheduled scraping
3. **Implement AI Generation**: Add Google Generative AI integration for draft generation
4. **Add Web Scraping**: Integrate Apify or custom scrapers for content sources

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

If you encounter any issues, please check:
1. Supabase project logs (Dashboard > Logs)
2. Browser console for errors
3. Network tab to see API request/response details
