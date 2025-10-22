# Getting Started with CreatorPulse

A quick start guide to get CreatorPulse up and running in minutes.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org))
- [ ] pnpm package manager installed (`npm install -g pnpm`)
- [ ] A Supabase account ([Sign up](https://supabase.com))
- [ ] Google Generative AI API key ([Get one](https://makersuite.google.com/app/apikey))

## Quick Setup (5 minutes)

### Step 1: Install Dependencies (1 min)

```bash
pnpm install
```

### Step 2: Create Supabase Project (2 min)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: CreatorPulse
   - **Database Password**: (save this!)
   - **Region**: Closest to you
4. Click "Create new project"
5. Wait for provisioning (~1-2 min)

### Step 3: Set Up Database (1 min)

1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Open `supabase-schema.sql` from this repo
4. Copy entire contents
5. Paste into SQL Editor
6. Click "Run"
7. Wait for success message

### Step 4: Configure Environment (1 min)

1. In Supabase dashboard, go to Settings > API
2. Copy your:
   - Project URL
   - `anon` key
   - `service_role` key (keep secret!)

3. Create `.env.local`:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` and paste your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
```

### Step 5: Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000 - you're done! 🎉

## First Steps in the App

### 1. Create Your Account

1. Go to http://localhost:3000/sign-up
2. Enter your email, name, and password
3. Click "Sign Up"
4. You should be automatically logged in

### 2. Connect Your First Source

1. Click "Sources" in the sidebar
2. Click "Add Source"
3. Choose a source type:
   - **Twitter**: Enter a username (e.g., `elonmusk`)
   - **YouTube**: Enter a channel URL
   - **Reddit**: Enter a subreddit (e.g., `technology`)
4. Click "Create"

### 3. Generate Your First Draft

1. Wait for your source to scrape (can take 1-2 minutes)
2. Go to "Drafts" in the sidebar
3. Click "Generate New Draft"
4. The AI will create a newsletter from your sources
5. Edit and refine as needed

### 4. Explore the Dashboard

1. Go to "Dashboard"
2. View your stats:
   - Sources connected
   - Drafts generated
   - Analytics (mock data for now)

## Troubleshooting

### "Failed to fetch" errors

**Problem**: Can't connect to API
**Solution**:
1. Make sure dev server is running (`pnpm dev`)
2. Check `.env.local` has correct values
3. Clear browser cache and reload

### "Unauthorized" errors

**Problem**: Authentication not working
**Solution**:
1. Check Supabase project is running (green dot in dashboard)
2. Verify API keys in `.env.local`
3. Clear cookies and try logging in again
4. Restart dev server

### Database errors

**Problem**: Can't read/write to database
**Solution**:
1. Verify schema was run successfully (check Tables in Supabase)
2. Check RLS policies are enabled
3. Look at Supabase logs (Dashboard > Logs)

### "User profile not created"

**Problem**: After signup, no profile exists
**Solution**:
1. Check the `handle_new_user()` trigger exists
2. Run the schema again if needed
3. Manually create profile in Table Editor

## Environment Variables Explained

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret admin key | Supabase Dashboard > Settings > API (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` for local |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | https://makersuite.google.com/app/apikey |
| `APIFY_API_KEY` | (Optional) Web scraping | https://console.apify.com/account/integrations |

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Install new package
pnpm add package-name
```

## File Structure at a Glance

```
Creator_Pulse-main/
├── app/
│   ├── api/              ← Backend API routes
│   ├── (auth)/           ← Login/signup pages
│   ├── dashboard/        ← Main dashboard
│   ├── drafts/           ← Draft management
│   └── sources/          ← Source management
├── components/           ← React components
├── lib/
│   └── supabase/         ← Supabase client setup
├── .env.local            ← Your environment variables (create this!)
├── supabase-schema.sql   ← Database schema (run in Supabase)
└── SUPABASE_SETUP.md     ← Detailed setup guide
```

## Common Tasks

### Reset Your Database

1. In Supabase dashboard, go to Database > Tables
2. Drop all tables
3. Re-run `supabase-schema.sql` in SQL Editor

### Change Your Plan

Plans are stored in the `users` table:

1. Go to Supabase > Table Editor > users
2. Find your user
3. Change `plan` field to: `starter`, `pro`, or `enterprise`

### View Logs

**Application Logs**: Check your terminal where `pnpm dev` is running

**Database Logs**: Supabase Dashboard > Logs > Database

**Auth Logs**: Supabase Dashboard > Logs > Auth

## Next Steps

Once you're up and running:

1. **Read the docs**:
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete setup guide
   - [CLAUDE.md](./CLAUDE.md) - Architecture guide
   - [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration details

2. **Customize your app**:
   - Add more source types
   - Customize the AI prompts
   - Add email integration
   - Set up scheduled scraping

3. **Deploy to production**:
   - Deploy to Vercel
   - Set up production Supabase project
   - Configure custom domain

## Getting Help

If you're stuck:

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
2. Review Supabase project logs
3. Check browser console for errors
4. Look at the Network tab in DevTools

## What's Next?

- [ ] Set up email provider for newsletters
- [ ] Configure scheduled scraping
- [ ] Add more content sources
- [ ] Train your AI voice
- [ ] Deploy to production

Happy newsletter creating! 🚀
