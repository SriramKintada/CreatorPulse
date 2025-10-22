-- CreatorPulse Supabase Database Schema
-- Migration from Firebase Firestore to Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  newsletter_delivery_email TEXT, -- Email where newsletters are sent (defaults to auth email if null)
  display_name TEXT NOT NULL,
  company TEXT DEFAULT '',
  timezone TEXT DEFAULT 'America/Los_Angeles',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),

  -- Preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "deliveryTime": "08:00",
    "deliveryFrequency": "daily",
    "topics": [],
    "emailNotifications": true,
    "weeklyDigest": true,
    "marketingEmails": false
  }'::jsonb,

  -- Voice Profile (JSONB)
  voice_profile JSONB DEFAULT '{
    "trained": false,
    "trainingExamples": [],
    "styleParameters": {
      "tone": "professional",
      "avgSentenceLength": 15,
      "vocabulary": "intermediate",
      "useEmojis": false,
      "useLists": true
    },
    "lastTrained": null
  }'::jsonb,

  -- Usage metrics
  usage_drafts_generated INTEGER DEFAULT 0,
  usage_drafts_sent INTEGER DEFAULT 0,
  usage_sources_connected INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources table (was subcollection in Firebase)
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('twitter', 'youtube', 'reddit', 'newsletter_rss', 'custom_url')),
  url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Configuration (JSONB for type-specific settings)
  config JSONB DEFAULT '{}'::jsonb,

  -- Scrape configuration
  scrape_frequency TEXT DEFAULT '0 */6 * * *',
  last_scrape_at TIMESTAMPTZ,
  last_scrape_status TEXT DEFAULT 'pending' CHECK (last_scrape_status IN ('pending', 'running', 'success', 'failed')),
  items_scraped_last_run INTEGER DEFAULT 0,
  error_message TEXT,

  -- Performance metrics
  total_items_scraped INTEGER DEFAULT 0,
  items_curated INTEGER DEFAULT 0,
  avg_relevance_score DECIMAL(3,2) DEFAULT 0.5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drafts table (was subcollection in Firebase)
CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'archived')),
  scheduled_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  -- AI generated content (JSONB)
  ai_title TEXT,
  ai_body TEXT,
  ai_curated_items JSONB DEFAULT '[]'::jsonb,
  ai_trends_section JSONB DEFAULT '[]'::jsonb,
  ai_intro TEXT,
  ai_closing TEXT,

  -- User edits (JSONB)
  user_edited_body TEXT,
  user_feedback_items JSONB DEFAULT '[]'::jsonb,
  user_total_edit_time INTEGER DEFAULT 0,

  -- Performance metrics
  performance_delivered INTEGER DEFAULT 0,
  performance_opened INTEGER DEFAULT 0,
  performance_clicked INTEGER DEFAULT 0,
  performance_open_rate DECIMAL(5,4) DEFAULT 0,
  performance_click_rate DECIMAL(5,4) DEFAULT 0,

  -- AI metrics
  ai_acceptance_rate DECIMAL(5,4) DEFAULT 0,
  ai_generation_time DECIMAL(6,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped content table
CREATE TABLE public.scraped_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,

  -- Content metadata
  external_id TEXT NOT NULL, -- original ID from source platform
  title TEXT,
  content_text TEXT,
  url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),

  -- Engagement metrics (source platform)
  engagement_likes INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  engagement_normalized DECIMAL(5,4) DEFAULT 0,

  -- AI processing
  processed_topics JSONB DEFAULT '[]'::jsonb,
  processed_keywords JSONB DEFAULT '[]'::jsonb,
  processed_sentiment DECIMAL(3,2),
  processed_relevance_score DECIMAL(3,2),

  -- Metadata
  media_urls JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trends table
CREATE TABLE public.trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'emerging' CHECK (status IN ('emerging', 'trending', 'declining')),
  trend_score DECIMAL(5,2) DEFAULT 0,

  -- Time windows
  mentions_24h INTEGER DEFAULT 0,
  mentions_7d INTEGER DEFAULT 0,
  mentions_30d INTEGER DEFAULT 0,

  -- Metadata
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  related_keywords JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed table (for dashboard)
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('draft_generated', 'draft_sent', 'source_added', 'source_scraped', 'voice_trained')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sources_user_id ON public.sources(user_id);
CREATE INDEX idx_sources_type ON public.sources(type);
CREATE INDEX idx_sources_status ON public.sources(status);
CREATE INDEX idx_sources_last_scrape ON public.sources(last_scrape_at DESC);

CREATE INDEX idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX idx_drafts_status ON public.drafts(status);
CREATE INDEX idx_drafts_generated_at ON public.drafts(generated_at DESC);
CREATE INDEX idx_drafts_scheduled_at ON public.drafts(scheduled_at);

CREATE INDEX idx_scraped_content_user_id ON public.scraped_content(user_id);
CREATE INDEX idx_scraped_content_source_id ON public.scraped_content(source_id);
CREATE INDEX idx_scraped_content_scraped_at ON public.scraped_content(scraped_at DESC);
CREATE INDEX idx_scraped_content_relevance ON public.scraped_content(processed_relevance_score DESC);
CREATE INDEX idx_scraped_content_external_id ON public.scraped_content(external_id);

CREATE INDEX idx_trends_status ON public.trends(status);
CREATE INDEX idx_trends_score ON public.trends(trend_score DESC);
CREATE INDEX idx_trends_keyword ON public.trends(keyword);

CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trends_updated_at BEFORE UPDATE ON public.trends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sources policies
CREATE POLICY "Users can view own sources"
  ON public.sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sources"
  ON public.sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sources"
  ON public.sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sources"
  ON public.sources FOR DELETE
  USING (auth.uid() = user_id);

-- Drafts policies
CREATE POLICY "Users can view own drafts"
  ON public.drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON public.drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON public.drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON public.drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Scraped content policies (read-only for users)
CREATE POLICY "Users can view own scraped content"
  ON public.scraped_content FOR SELECT
  USING (auth.uid() = user_id);

-- Trends policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view trends"
  ON public.trends FOR SELECT
  TO authenticated
  USING (true);

-- Activity feed policies
CREATE POLICY "Users can view own activity"
  ON public.activity_feed FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle user creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to increment usage counters
CREATE OR REPLACE FUNCTION increment_user_usage(
  user_id_param UUID,
  field_name TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  CASE field_name
    WHEN 'drafts_generated' THEN
      UPDATE public.users
      SET usage_drafts_generated = usage_drafts_generated + increment_by
      WHERE id = user_id_param;
    WHEN 'drafts_sent' THEN
      UPDATE public.users
      SET usage_drafts_sent = usage_drafts_sent + increment_by
      WHERE id = user_id_param;
    WHEN 'sources_connected' THEN
      UPDATE public.users
      SET usage_sources_connected = usage_sources_connected + increment_by
      WHERE id = user_id_param;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
