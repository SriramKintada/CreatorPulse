-- Migration: Add newsletter_delivery_email column to users table
-- Run this in Supabase SQL Editor if you already have the database set up

-- Add the column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS newsletter_delivery_email TEXT;

-- Add comment
COMMENT ON COLUMN public.users.newsletter_delivery_email IS 'Email where newsletters are sent (defaults to auth email if null)';
