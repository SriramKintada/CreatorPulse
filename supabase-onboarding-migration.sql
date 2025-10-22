-- Add onboarding status to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Update preferences default to include delivery schedule
ALTER TABLE public.users
ALTER COLUMN preferences SET DEFAULT '{
  "deliveryTime": "08:00",
  "deliveryFrequency": "weekly",
  "deliveryDay": "monday",
  "topics": [],
  "emailNotifications": true,
  "weeklyDigest": true,
  "marketingEmails": false
}'::jsonb;

-- Create index for faster onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(onboarding_completed);

COMMENT ON COLUMN public.users.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN public.users.onboarding_step IS 'Current step in onboarding (0-5)';
