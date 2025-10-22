# 🚀 CreatorPulse Deployment Guide

## Current Status: ❌ NOT DEPLOYED

Your project is currently **only running locally** on your machine. No backend is hosted yet.

---

## 📋 What You Need Before Deploying

### ✅ Already Configured (You Have These)
- Supabase project: `qghduyapgdmadfwdusvk.supabase.co`
- Google Generative AI API key
- Apify API token
- Exa.ai API key

### ⚠️ Still Need to Set Up
- GitHub repository (to store your code)
- Vercel account (to host the app)
- Google OAuth credentials (for Google sign-in)
- Resend API key verification
- Cron secret for automated jobs

---

## 🚀 Step-by-Step Deployment

### Step 1: Commit Your Code to Git

Your code has **no commits yet**. Let's fix that:

```bash
# Initialize git (already done, but verify)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - CreatorPulse with voice training and auth"
```

### Step 2: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com/new

2. **Create Repository:**
   - Repository name: `creator-pulse`
   - Description: "AI-powered newsletter automation with voice training"
   - Keep it **Private** (recommended) or Public
   - **Don't** initialize with README, .gitignore, or license (you already have these)
   - Click "Create repository"

3. **Link Your Local Repo to GitHub:**
   ```bash
   # Add GitHub as remote
   git remote add origin https://github.com/YOUR_USERNAME/creator-pulse.git

   # Push to GitHub
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit: https://vercel.com/
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `creator-pulse`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `.next` (should auto-detect)

4. **Add Environment Variables:**

   Click "Environment Variables" and add ALL of these:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://qghduyapgdmadfwdusvk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaGR1eWFwZ2RtYWRmd2R1c3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTgzMjgsImV4cCI6MjA3NjI3NDMyOH0.pDZI1U4bhZRTw2X1zL4iws63QkEwOl8fYITsnHI33fg
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaGR1eWFwZ2RtYWRmd2R1c3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5ODMyOCwiZXhwIjoyMDc2Mjc0MzI4fQ.NJBC9lSLO3aiFLRFzm-y84UTluz7uxPLM99FG1Zs2NI

   # App URL (will be your Vercel URL)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   # AI & APIs
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
   APIFY_API_TOKEN=your-apify-api-token
   EXA_API_KEY=your-exa-api-key

   # Email sending
   RESEND_API_KEY=your-resend-api-key

   # Cron job security (generate a new random secret)
   CRON_SECRET=generate-a-random-32-character-string-here
   ```

   **Generate CRON_SECRET:**
   ```bash
   # On Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

   # Or use this online generator:
   # https://generate-secret.vercel.app/32
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://creator-pulse-abc123.vercel.app`

6. **Update NEXT_PUBLIC_APP_URL:**
   - Copy your Vercel URL
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy (Deployments → Three dots → Redeploy)

### Step 4: Run Database Migrations

Your Supabase database needs the onboarding columns:

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com/
   - Select your project: `qghduyapgdmadfwdusvk`

2. **Run SQL Migration:**
   - Go to "SQL Editor"
   - Click "New Query"
   - Copy the contents of `supabase-onboarding-migration.sql`
   - Paste and click "Run"

3. **Verify Migration:**
   - Go to "Table Editor"
   - Select "users" table
   - Check that these columns exist:
     - `onboarding_completed`
     - `onboarding_step`
     - `voice_profile`

### Step 5: Configure Google OAuth (Optional but Recommended)

Follow `GOOGLE_OAUTH_SETUP.md` to enable "Sign in with Google":

1. Create Google OAuth credentials
2. Add to Supabase Auth Providers
3. Update redirect URIs with your Vercel URL:
   ```
   https://your-app.vercel.app/auth/callback
   ```

### Step 6: Update Supabase Auth Settings

1. **Go to Supabase Dashboard:**
   - Authentication → URL Configuration

2. **Add Redirect URLs:**
   ```
   https://your-app.vercel.app/auth/callback
   ```

3. **Add Site URL:**
   ```
   https://your-app.vercel.app
   ```

4. **Save Changes**

### Step 7: Verify Cron Jobs

Vercel should automatically detect your `vercel.json` and set up cron jobs:

1. **Check Cron Jobs:**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - Should see:
     - `/api/cron/auto-scrape` (every 6 hours)
     - `/api/cron/auto-generate` (daily at 8 AM)

2. **Test Cron Jobs:**
   ```bash
   # Test auto-scrape
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/auto-scrape

   # Test auto-generate
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/auto-generate
   ```

---

## ✅ Post-Deployment Checklist

After deployment, verify everything works:

### Test Authentication
- [ ] Visit `https://your-app.vercel.app/sign-up`
- [ ] Create an account with email/password
- [ ] Verify redirect to onboarding
- [ ] Complete onboarding flow
- [ ] Check that user profile was created in Supabase

### Test Google OAuth (if configured)
- [ ] Visit `https://your-app.vercel.app/login`
- [ ] Click "Sign in with Google"
- [ ] Complete Google sign-in
- [ ] Verify redirect to onboarding (new user) or dashboard (existing)

### Test Voice Training
- [ ] Navigate to `/train-voice`
- [ ] Upload a text file (min 100 chars)
- [ ] Click "Train Voice"
- [ ] Verify voice profile saved
- [ ] Check voice profile displayed on page

### Test Source Management
- [ ] Navigate to `/sources`
- [ ] Add a new source (YouTube or RSS)
- [ ] Click "Scrape Now"
- [ ] Verify content scraped
- [ ] Check `scraped_content` table in Supabase

### Test Draft Generation
- [ ] Navigate to `/drafts`
- [ ] Click "Generate Draft"
- [ ] Wait for generation (30-60 seconds)
- [ ] Verify draft appears with your voice style
- [ ] Check anti-slop rules followed

### Test Cron Jobs
- [ ] Wait 6+ hours or manually trigger
- [ ] Check Vercel → Project → Logs → Cron Jobs
- [ ] Verify successful execution
- [ ] Check Supabase for new scraped content

---

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error:** `Module not found` or `Cannot find module`

**Fix:**
```bash
# Make sure package-lock.json or pnpm-lock.yaml is committed
git add package-lock.json pnpm-lock.yaml
git commit -m "Add lockfile"
git push
```

### Environment Variables Not Working

**Error:** `NEXT_PUBLIC_SUPABASE_URL is undefined`

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Make sure all `NEXT_PUBLIC_*` variables are added
3. Redeploy: Deployments → Three dots → Redeploy

### Authentication Redirects to Localhost

**Error:** After login, redirects to `http://localhost:3000`

**Fix:**
1. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
2. Use your actual Vercel URL: `https://your-app.vercel.app`
3. Redeploy

### Cron Jobs Not Running

**Error:** No cron executions in Vercel logs

**Fix:**
1. Check that `vercel.json` is committed to git
2. Verify cron jobs appear in Vercel Dashboard → Cron Jobs
3. Make sure `CRON_SECRET` is set in environment variables
4. Check Vercel → Logs for cron errors

### Google OAuth Not Working

**Error:** "Redirect URI mismatch"

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Add authorized redirect URI:
   ```
   https://your-app.vercel.app/auth/callback
   https://qghduyapgdmadfwdusvk.supabase.co/auth/v1/callback
   ```
3. Wait 5 minutes for changes to propagate

### Supabase Connection Issues

**Error:** "Invalid API key"

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy keys again
3. Update in Vercel environment variables
4. Redeploy

---

## 📊 Monitoring Your Deployment

### Check Application Health

**Vercel:**
- Dashboard → Your Project → Analytics
- Monitor:
  - Response times
  - Error rates
  - Bandwidth usage
  - Function executions

**Supabase:**
- Dashboard → Database → Logs
- Monitor:
  - Query performance
  - Auth events
  - Storage usage

### View Logs

**Real-time logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs your-app.vercel.app
```

**Or in Vercel Dashboard:**
- Your Project → Logs
- Filter by:
  - Functions
  - Cron
  - Static
  - Build

---

## 🔄 Updating Your Deployment

### Deploy New Changes

```bash
# Make changes to your code
# ... edit files ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub (auto-deploys to Vercel)
git push origin main
```

**Vercel automatically:**
1. Detects push to GitHub
2. Starts new build
3. Runs tests (if configured)
4. Deploys to production
5. Updates URL

### Manual Redeploy

If you need to redeploy without code changes:
1. Go to Vercel Dashboard
2. Your Project → Deployments
3. Click three dots on latest deployment
4. Click "Redeploy"

---

## 💰 Cost Estimates

### Free Tier (For Testing)

**Vercel:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Cron jobs included
- ✅ Edge functions

**Supabase:**
- ✅ 500 MB database
- ✅ 1 GB storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth

**Google Gemini:**
- ✅ 15 requests/minute free
- ✅ 1,500 requests/day free

**Total: $0/month** for low traffic

### Production Usage (Estimated)

**For 100 active users:**
- Vercel Pro: $20/month (for better performance)
- Supabase Pro: $25/month (for more storage)
- Google Gemini: ~$10/month (for newsletter generation)
- Apify: ~$10/month (for scraping if used)
- Resend: $20/month (for email sending)

**Total: ~$85/month**

---

## 🎉 Deployment Summary

Once you complete these steps:

✅ **Your app will be live at:** `https://your-app.vercel.app`

✅ **Features that will work:**
- User sign-up and login
- Google OAuth authentication
- Voice training with file uploads
- Source management (add YouTube, RSS, etc.)
- Content scraping (manual and automated)
- Newsletter draft generation with AI
- Onboarding flow for new users
- Automated cron jobs (every 6 hours + daily)

✅ **Backend services running:**
- Next.js API routes on Vercel
- Supabase PostgreSQL database
- Supabase Auth for authentication
- Vercel Cron for automation

✅ **No manual server management needed** - everything is serverless!

---

## 📞 Need Help?

**Check these first:**
1. Vercel logs for errors
2. Supabase logs for database issues
3. Browser console for client-side errors

**Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## 🚀 Ready to Deploy?

Run these commands now:

```bash
# 1. Commit your code
git add .
git commit -m "Initial commit - CreatorPulse"

# 2. Create GitHub repo (via website), then:
git remote add origin https://github.com/YOUR_USERNAME/creator-pulse.git
git push -u origin main

# 3. Deploy to Vercel (via website)
# Visit: https://vercel.com/new

# 4. Run Supabase migration
# Copy supabase-onboarding-migration.sql to Supabase SQL Editor

# 5. Test your app
# Visit: https://your-app.vercel.app
```

**Your backend will be hosted after Step 3!** 🎉
