# Automation & Cronjobs Guide - CreatorPulse

## Overview

CreatorPulse has **3 automated cronjobs** that handle content scraping, newsletter generation, and automatic delivery. These jobs run on Vercel Cron and ensure your newsletter workflow is fully automated.

## Configured Cronjobs

### 1. Auto-Scrape Job ⚙️

**Schedule:** Every 6 hours
**Cron Expression:** `0 */6 * * *`
**API Endpoint:** `/api/cron/auto-scrape`

**What It Does:**
- Scrapes all active sources for ALL users
- Supports: Twitter, YouTube, Reddit, RSS feeds, custom URLs
- Stores new content in `scraped_content` table
- Automatically deduplicates content (checks `external_id`)
- Updates source statistics (last_scrape_at, items_scraped, etc.)

**Runs at:** 12am, 6am, 12pm, 6pm UTC

**Example Output:**
```
🔄 AUTO-SCRAPE CRON JOB STARTED
📊 Found 15 active sources to scrape
🔄 Scraping: TechCrunch (newsletter_rss)
   📥 Scraped 10 items
   ✅ Inserted 8 new items (2 duplicates)
✅ AUTO-SCRAPE COMPLETED
   Duration: 45.2s
   Sources processed: 15
   New items: 120
   Errors: 0
```

---

### 2. Auto-Generate Job 🤖

**Schedule:** Daily at 8 AM UTC
**Cron Expression:** `0 8 * * *`
**API Endpoint:** `/api/cron/auto-generate`

**What It Does:**
- Checks each user's newsletter schedule preferences
- Generates AI-powered newsletter drafts using Google Gemini
- Creates drafts based on:
  - **Primary Content:** Last 48 hours (15 items)
  - **Evergreen Content:** 2-7 days old, high engagement (5 items)
  - **Trending Content:** Last 72 hours, sorted by engagement (3 items)
- Respects user's delivery frequency (daily, weekly, biweekly, monthly)
- Only generates if it's the user's scheduled day/time

**User Preferences Used:**
- `deliveryFrequency`: daily | weekly | biweekly | monthly
- `deliveryTime`: "08:00" (hour)
- `deliveryDay`: "monday" (for weekly/biweekly)

**Example Output:**
```
🤖 AUTO-GENERATE CRON JOB STARTED
📅 Current: monday, 8:00
👥 Found 50 active users

✅ Generating draft for user@example.com...
   📊 Content: 15 primary, 5 evergreen, 3 trending
   ✅ Draft created: draft-uuid-123

⏭️ Skipping user2@example.com (weekly on friday at 10:00)

✅ AUTO-GENERATE COMPLETED
   Duration: 12.5s
   Users processed: 50
   Drafts generated: 8
   Errors: 0
```

---

### 3. Auto-Send Job 📧 (NEW!)

**Schedule:** Every hour
**Cron Expression:** `0 * * * *`
**API Endpoint:** `/api/cron/auto-send`

**What It Does:**
- Checks for users with unsent drafts
- Sends newsletters at user's scheduled time
- Uses Resend API to deliver beautiful HTML emails
- Sends to all subscribers with email notifications enabled
- Uses `newsletter_delivery_email` or falls back to login email
- Marks drafts as "sent" after successful delivery
- Logs activity in activity_feed

**Example Output:**
```
📧 AUTO-SEND CRON JOB STARTED
📅 Current: monday, 8:00
👥 Found 12 users with unsent drafts

✅ Sending newsletter for user@example.com...
   📧 Sending to 150 subscriber(s)...
   ✅ Sent to subscriber1@example.com
   ✅ Sent to subscriber2@example.com
   📊 Results: 150 sent, 0 failed

⏭️ Skipping user2@example.com (weekly on friday at 10:00)

✅ AUTO-SEND COMPLETED
   Duration: 25.8s
   Users processed: 12
   Newsletters sent: 4
   Errors: 0
```

---

## Complete Automation Workflow

Here's how the full automation works from adding sources to receiving emails:

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: User Adds Sources                                    │
│ • User adds 5 sources via Quick Add or Custom Form           │
│ • Sources saved with status: "active"                        │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Auto-Scrape (Every 6 Hours)                          │
│ • 12am, 6am, 12pm, 6pm UTC                                   │
│ • Scrapes all 5 sources                                      │
│ • Stores ~50 content items in database                       │
│ • Deduplicates automatically                                 │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: Auto-Generate (Daily at 8 AM UTC)                    │
│ • Checks user's schedule: "weekly on Monday at 8am"          │
│ • If today is Monday and hour is 8am:                        │
│   - Fetches recent content (primary + evergreen + trending)  │
│   - Generates newsletter using Google Gemini AI              │
│   - Creates draft in database                                │
│ • If not scheduled day, skips user                           │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Auto-Send (Every Hour)                               │
│ • Checks user's schedule: "weekly on Monday at 8am"          │
│ • If today is Monday and hour is 8am:                        │
│   - Finds latest unsent draft                                │
│   - Sends to all subscribers via Resend                      │
│   - Marks draft as "sent"                                    │
│   - Logs activity                                            │
│ • If not scheduled time, skips user                          │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ RESULT: Subscribers Receive Email                            │
│ • Beautiful HTML newsletter                                  │
│ • Personalized greeting                                      │
│ • Curated content items                                      │
│ • Trending topics                                            │
│ • Sent from: onboarding@resend.dev                           │
└──────────────────────────────────────────────────────────────┘
```

---

## How to Test Locally

Since cronjobs only run on Vercel in production, here's how to test locally:

### 1. Test Auto-Scrape Manually

```bash
# Windows PowerShell
curl http://localhost:3000/api/cron/auto-scrape `
  -H "Authorization: Bearer your-cron-secret"

# OR use the manual scrape API (no auth needed during dev)
curl -X POST http://localhost:3000/api/scrape `
  -H "Content-Type: application/json"
```

### 2. Test Auto-Generate Manually

```bash
# Windows PowerShell
curl http://localhost:3000/api/cron/auto-generate `
  -H "Authorization: Bearer your-cron-secret"

# OR use the drafts API
curl -X POST http://localhost:3000/api/drafts `
  -H "Content-Type: application/json" `
  -H "Cookie: your-session-cookie"
```

### 3. Test Auto-Send Manually

```bash
# Windows PowerShell
curl http://localhost:3000/api/cron/auto-send `
  -H "Authorization: Bearer your-cron-secret"

# OR use the send-newsletter API
curl -X POST http://localhost:3000/api/send-newsletter `
  -H "Content-Type: application/json" `
  -d '{"draftId":"your-draft-id"}' `
  -H "Cookie: your-session-cookie"
```

---

## Testing the Full Automation Flow

### Quick Test (5 Sources → Email in Minutes)

1. **Add 5 sources** (e.g., TechCrunch, Hacker News, etc.)
2. **Manually trigger scrape:**
   ```bash
   curl -X POST http://localhost:3000/api/scrape
   ```
3. **Check database** - Verify content was scraped:
   ```sql
   SELECT COUNT(*) FROM scraped_content WHERE user_id = 'your-user-id';
   ```
4. **Manually generate draft:**
   ```bash
   curl -X POST http://localhost:3000/api/drafts
   ```
5. **Go to Drafts page** - You should see a new draft
6. **Send the newsletter** - Click "Send Newsletter" button
7. **Check your email** - You should receive the newsletter!

### Full Automation Test (Set Schedule)

1. **Go to Settings → Newsletter Schedule**
2. **Set your schedule:**
   - Frequency: Daily
   - Delivery Time: Current hour + 1 (e.g., if it's 2pm, set to 3pm)
   - Delivery Day: Today's day
3. **Add sources and wait for scraping** (or manually trigger)
4. **Wait for scheduled time** (e.g., 3pm)
5. **Auto-generate will create draft**
6. **Auto-send will send newsletter**
7. **Check your email inbox!**

---

## Environment Variables Required

Add these to your `.env.local` and Vercel environment variables:

```env
# Resend (Email Delivery)
RESEND_API_KEY=re_Hjk4xgKw_PE7iP2dAEBS88dWudRLT5CUN

# Vercel Cron Security
CRON_SECRET=your-random-secret-string

# Google AI (Newsletter Generation)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key

# Apify (Content Scraping)
APIFY_API_TOKEN=your-apify-token

# Exa.ai (RSS Feeds)
EXA_API_KEY=your-exa-api-key
```

**Generate CRON_SECRET:**
```bash
# Generate random secret
openssl rand -base64 32

# Or use online: https://generate-secret.vercel.app
```

**Add to Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add `CRON_SECRET` with your generated secret
4. Add for Production, Preview, and Development
5. Redeploy your project

---

## Monitoring Cronjobs

### In Vercel Dashboard

1. Go to **Deployments** → Click your deployment
2. **Functions** tab → Filter by "cron"
3. View logs for each cronjob execution
4. Check success/failure status
5. See execution duration

### In Database (Activity Feed)

```sql
-- Check draft generation activity
SELECT * FROM activity_feed
WHERE activity_type = 'draft_generated'
ORDER BY created_at DESC;

-- Check newsletter send activity
SELECT * FROM activity_feed
WHERE activity_type = 'newsletter_sent'
ORDER BY created_at DESC;

-- Check scraping status
SELECT name, last_scrape_at, last_scrape_status, items_scraped_last_run
FROM sources
WHERE user_id = 'your-user-id'
ORDER BY last_scrape_at DESC;
```

### In Application

- **Dashboard:** Shows recent activity
- **Sources Page:** Shows last scrape time and status
- **Drafts Page:** Shows auto-generated drafts with "Auto-generated" badge
- **Activity Feed:** Shows all automated actions

---

## Troubleshooting

### Cronjob Not Running

**Issue:** Cronjobs don't execute at scheduled time

**Fixes:**
1. ✅ Verify `vercel.json` is committed to git
2. ✅ Check `CRON_SECRET` is set in Vercel environment variables
3. ✅ Redeploy after adding environment variables
4. ✅ Check Vercel Functions logs for errors
5. ✅ Ensure you're on a paid Vercel plan (Hobby plan supports cron)

### No Content Scraped

**Issue:** Auto-scrape runs but no content is stored

**Fixes:**
1. ✅ Verify sources are set to `status: 'active'`
2. ✅ Check API keys are set (APIFY_API_TOKEN, EXA_API_KEY)
3. ✅ Review source URLs are valid
4. ✅ Check Vercel logs for scraping errors
5. ✅ Manually trigger scrape to test: `/api/scrape`

### No Drafts Generated

**Issue:** Auto-generate runs but no drafts created

**Fixes:**
1. ✅ Verify you have at least 5 content items in database
2. ✅ Check `GOOGLE_GENERATIVE_AI_API_KEY` is set
3. ✅ Verify user's schedule matches current day/time
4. ✅ Check user's `deliveryFrequency` preference
5. ✅ Review Vercel logs for generation errors

### Emails Not Sent

**Issue:** Auto-send runs but emails aren't delivered

**Fixes:**
1. ✅ Verify `RESEND_API_KEY` is set
2. ✅ Check there are unsent drafts (status: 'draft')
3. ✅ Verify subscribers have email notifications enabled
4. ✅ Check Resend dashboard for delivery errors
5. ✅ Verify sender email: `onboarding@resend.dev`
6. ✅ Test manually: `/api/send-newsletter`

---

## Schedule Examples

### Daily Newsletter at 9 AM

```javascript
{
  deliveryFrequency: 'daily',
  deliveryTime: '09:00',
  deliveryDay: 'monday' // Not used for daily
}
```

**Result:**
- Auto-scrape: Every 6 hours (continuous content collection)
- Auto-generate: Daily at 9 AM (creates draft)
- Auto-send: Daily at 9 AM (sends newsletter)

### Weekly Newsletter on Monday at 8 AM

```javascript
{
  deliveryFrequency: 'weekly',
  deliveryTime: '08:00',
  deliveryDay: 'monday'
}
```

**Result:**
- Auto-scrape: Every 6 hours all week (collects content)
- Auto-generate: Monday at 8 AM only (creates draft)
- Auto-send: Monday at 8 AM only (sends newsletter)

### Biweekly Newsletter on Friday at 10 AM

```javascript
{
  deliveryFrequency: 'biweekly',
  deliveryTime: '10:00',
  deliveryDay: 'friday'
}
```

**Result:**
- Auto-scrape: Every 6 hours continuously
- Auto-generate: Every other Friday at 10 AM (creates draft)
- Auto-send: Every other Friday at 10 AM (sends newsletter)

### Monthly Newsletter on 1st at 7 AM

```javascript
{
  deliveryFrequency: 'monthly',
  deliveryTime: '07:00',
  deliveryDay: 'monday' // Not used for monthly (always 1st of month)
}
```

**Result:**
- Auto-scrape: Every 6 hours continuously
- Auto-generate: 1st of every month at 7 AM (creates draft)
- Auto-send: 1st of every month at 7 AM (sends newsletter)

---

## Summary

✅ **3 Cronjobs Running:**
1. Auto-Scrape (every 6 hours) - Collects content
2. Auto-Generate (daily at 8 AM) - Creates drafts
3. Auto-Send (every hour) - Delivers newsletters

✅ **Fully Automated Workflow:**
Add sources → Content scrapes automatically → Drafts generate on schedule → Emails send on schedule

✅ **User Controls:**
- Schedule in Settings (frequency, day, time)
- Email preferences (notifications on/off)
- Delivery email address
- Voice profile for personalization

✅ **Testing:**
- Manual API calls for local development
- Vercel logs for production monitoring
- Activity feed for user-facing status

**Result:** Set it and forget it! Add your sources, configure your schedule, and newsletters deliver automatically. 🚀
