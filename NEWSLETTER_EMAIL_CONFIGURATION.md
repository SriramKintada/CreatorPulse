# Newsletter Email Configuration Feature

## Overview

This feature allows users to configure which email address should receive their generated newsletter drafts. Users can choose to use their login email or specify a different email address for newsletter delivery.

## User Flow

### During Onboarding (Step 4)

1. After training their voice (Step 3), users are presented with the "Set Your Preferences" page
2. The page includes two main sections:
   - **Newsletter Delivery Email**: Where to send generated drafts
   - **Generation Schedule**: When to generate drafts

3. **Newsletter Delivery Email Options:**
   - **Option 1**: "Use my login email" (default)
     - Shows the user's login email address
     - Newsletter drafts will be sent to their Supabase auth email

   - **Option 2**: "Use a different email"
     - Reveals an email input field
     - User can enter any valid email address
     - Email validation is performed before saving

4. User clicks "Continue" to save preferences and move to Step 5 (Generate First Newsletter)

### In Settings Page

Users can change their newsletter delivery email at any time:

1. Navigate to **Settings** → **Newsletter Schedule** tab
2. Section "Newsletter Delivery Email" appears at the top
3. Same two options as onboarding:
   - Use my login email
   - Use a different email
4. Changes are saved when user clicks "Save Settings"

## Technical Implementation

### Database Schema

**Table:** `users`

**New Column:**
```sql
newsletter_delivery_email TEXT  -- Email where newsletters are sent (defaults to auth email if null)
```

- **Type:** TEXT (nullable)
- **Default:** NULL
- **Behavior:**
  - If NULL: Use auth.users.email
  - If set: Use this email for newsletter delivery

**Migration SQL:**
```sql
-- Run this in Supabase SQL Editor to add the column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS newsletter_delivery_email TEXT;

COMMENT ON COLUMN public.users.newsletter_delivery_email IS 'Email where newsletters are sent (defaults to auth email if null)';
```

### Frontend Components

#### Onboarding Page (`app/onboarding/page.tsx`)

**State Variables:**
```typescript
const [useLoginEmail, setUseLoginEmail] = useState(true)
const [newsletterEmail, setNewsletterEmail] = useState("")
const [userEmail, setUserEmail] = useState("")
```

**Save Logic:**
```typescript
const handleSaveSchedule = async () => {
  // Validate email if using different email
  if (!useLoginEmail && !newsletterEmail) {
    toast.error("Please enter a newsletter delivery email")
    return
  }

  if (!useLoginEmail && newsletterEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterEmail)) {
      toast.error("Please enter a valid email address")
      return
    }
  }

  // Determine which email to use
  const deliveryEmail = useLoginEmail ? null : newsletterEmail

  const { error } = await supabase
    .from("users")
    .update({
      preferences,
      newsletter_delivery_email: deliveryEmail
    })
    .eq("id", user.id)
}
```

#### Settings Page (`app/settings\page.tsx`)

**Features:**
- Fetches current `newsletter_delivery_email` from database
- Displays login email from `auth.users`
- Radio group to switch between login email and different email
- Email input field appears when "Use a different email" is selected
- Validates email format before saving
- Updates database on save

**Save Logic:**
```typescript
const handleSave = async () => {
  // Validate newsletter email
  if (!formData.useLoginEmail && !formData.newsletterDeliveryEmail) {
    toast.error("Please enter a newsletter delivery email")
    return
  }

  if (!formData.useLoginEmail && formData.newsletterDeliveryEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.newsletterDeliveryEmail)) {
      toast.error("Please enter a valid email address")
      return
    }
  }

  const updateData: any = {
    // ... other fields
    newsletter_delivery_email: formData.useLoginEmail ? null : formData.newsletterDeliveryEmail,
  }

  await supabase.from("users").update(updateData).eq("id", userId)
}
```

### Backend API

#### Send Newsletter API (`app/api/send-newsletter/route.ts`)

**Updated Logic:**

```typescript
// Fetch all users with email notifications enabled
const { data: subscribers } = await supabase
  .from('users')
  .select('email, display_name, preferences, newsletter_delivery_email')
  .eq('status', 'active')

// Use newsletter_delivery_email if set, otherwise use login email
const recipients = subscribers
  .filter((sub) => {
    const prefs = sub.preferences || {}
    return prefs.emailNotifications !== false
  })
  .map((sub) => sub.newsletter_delivery_email || sub.email)
```

**How it works:**
1. Fetches all active users
2. Includes `newsletter_delivery_email` field in the query
3. Filters users with email notifications enabled
4. Maps to email addresses using:
   - `newsletter_delivery_email` if set (not null)
   - Falls back to `email` (auth email) if null
5. Sends newsletters to the resulting email addresses

## User Experience

### Default Behavior

- By default, users receive newsletters at their login email
- No action required during onboarding
- `newsletter_delivery_email` is NULL in database

### Custom Email Setup

1. User selects "Use a different email" during onboarding or in settings
2. Enters a valid email address (e.g., personal email, work email, team email)
3. Email is validated using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
4. Saved to `newsletter_delivery_email` column
5. All future newsletters sent to this email

### Switching Between Emails

Users can switch back and forth:
- **To login email**: Select "Use my login email" → `newsletter_delivery_email` set to NULL
- **To different email**: Select "Use a different email" → Enter email → `newsletter_delivery_email` updated

## Use Cases

### Use Case 1: Personal Newsletter Forwarding
**Scenario:** User signs up with work email but wants newsletters at personal email

**Steps:**
1. Sign up with `work@company.com`
2. During onboarding Step 4, select "Use a different email"
3. Enter `personal@gmail.com`
4. All newsletter drafts sent to personal email

### Use Case 2: Team Collaboration
**Scenario:** Team wants newsletters sent to shared inbox

**Steps:**
1. Sign up with individual account
2. Navigate to Settings → Newsletter Schedule
3. Change delivery email to `team-newsletters@company.com`
4. Team can review drafts collaboratively

### Use Case 3: Email Migration
**Scenario:** User changes email providers

**Steps:**
1. Login with old email
2. Go to Settings → Newsletter Schedule
3. Update delivery email to new address
4. Continue receiving newsletters without changing auth account

## Validation & Error Handling

### Email Validation

**Regex Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Examples:**
- ✅ Valid: `user@example.com`, `john.doe+newsletters@company.co.uk`
- ❌ Invalid: `user@`, `@example.com`, `user`, `user@.com`

**Error Messages:**
- "Please enter a newsletter delivery email" - When different email selected but field empty
- "Please enter a valid email address" - When email format is invalid

### Database Constraints

- Column is nullable (NULL = use login email)
- No unique constraint (multiple users can share delivery email)
- No foreign key constraint (any valid email accepted)

## Testing

### Test Scenarios

#### 1. Onboarding Flow
```
Test: Default behavior (use login email)
1. Complete onboarding without changing email option
2. Check database: newsletter_delivery_email should be NULL
3. Send newsletter
4. Verify email sent to auth.users.email

Test: Custom email during onboarding
1. Reach Step 4 of onboarding
2. Select "Use a different email"
3. Enter test@example.com
4. Complete onboarding
5. Check database: newsletter_delivery_email = 'test@example.com'
6. Send newsletter
7. Verify email sent to test@example.com
```

#### 2. Settings Page
```
Test: Change from login email to different email
1. Navigate to Settings → Newsletter Schedule
2. Verify "Use my login email" is selected by default
3. Select "Use a different email"
4. Enter new email address
5. Click "Save Settings"
6. Verify success toast appears
7. Refresh page and verify new email is shown
8. Check database: newsletter_delivery_email updated

Test: Change from different email back to login email
1. Navigate to Settings → Newsletter Schedule
2. Select "Use my login email"
3. Click "Save Settings"
4. Check database: newsletter_delivery_email = NULL
```

#### 3. Email Validation
```
Test: Invalid email format
1. Select "Use a different email"
2. Enter invalid email: "notanemail"
3. Click save
4. Verify error toast: "Please enter a valid email address"
5. Database should not be updated

Test: Empty email field
1. Select "Use a different email"
2. Leave email field empty
3. Click save
4. Verify error toast: "Please enter a newsletter delivery email"
```

#### 4. Newsletter Sending
```
Test: Send to custom email
1. Set newsletter_delivery_email to custom email
2. Generate and send newsletter
3. Verify email sent to custom email, not login email

Test: Send to login email (NULL case)
1. Set newsletter_delivery_email to NULL
2. Generate and send newsletter
3. Verify email sent to auth.users.email
```

### Manual Testing Checklist

- [ ] Onboarding: Default (use login email) works
- [ ] Onboarding: Custom email works
- [ ] Onboarding: Email validation prevents invalid emails
- [ ] Settings: Load current email preference correctly
- [ ] Settings: Switch to different email
- [ ] Settings: Switch back to login email
- [ ] Settings: Email validation works
- [ ] Newsletter: Sent to custom email when set
- [ ] Newsletter: Sent to login email when NULL
- [ ] Database: newsletter_delivery_email column exists
- [ ] Database: NULL vs custom email values correct

## Database Query Examples

### Check User's Newsletter Email

```sql
-- See where newsletters will be sent for a user
SELECT
  id,
  email as login_email,
  newsletter_delivery_email,
  COALESCE(newsletter_delivery_email, email) as actual_delivery_email
FROM users
WHERE id = 'USER_ID_HERE';
```

### Find Users with Custom Delivery Emails

```sql
-- Users who use different email for newsletters
SELECT
  id,
  display_name,
  email as login_email,
  newsletter_delivery_email
FROM users
WHERE newsletter_delivery_email IS NOT NULL
ORDER BY created_at DESC;
```

### Get All Newsletter Recipients

```sql
-- See where all newsletters will be sent (mimics API logic)
SELECT
  id,
  display_name,
  email as login_email,
  newsletter_delivery_email,
  COALESCE(newsletter_delivery_email, email) as delivery_email,
  preferences->'emailNotifications' as email_notifications_enabled
FROM users
WHERE status = 'active'
  AND (preferences->>'emailNotifications')::boolean != false
ORDER BY created_at DESC;
```

## Future Enhancements

### Possible Improvements

1. **Email Verification**
   - Send confirmation email to custom address before activating
   - Prevent typos and invalid addresses
   - Add "verified" status to newsletter_delivery_email

2. **Multiple Recipients**
   - Allow multiple delivery emails (JSON array)
   - Send same newsletter to multiple addresses
   - Useful for teams or backup emails

3. **Email Preferences Per Newsletter**
   - Different emails for different newsletter types
   - Daily digest to one email, weekly roundup to another

4. **Delivery History**
   - Track which email received which newsletter
   - Show delivery status in UI
   - Resend to different email if needed

5. **Email Templates**
   - Save common email addresses as templates
   - Quick switch between "Work", "Personal", "Team"

## Troubleshooting

### Newsletter Not Received

**Check:**
1. Is `preferences.emailNotifications` set to true?
   ```sql
   SELECT preferences->'emailNotifications' FROM users WHERE id = 'USER_ID';
   ```

2. Is the delivery email correct?
   ```sql
   SELECT
     email,
     newsletter_delivery_email,
     COALESCE(newsletter_delivery_email, email) as delivery_target
   FROM users WHERE id = 'USER_ID';
   ```

3. Check Resend dashboard for delivery status
4. Verify email address in spam folder

### Cannot Save Custom Email

**Check:**
1. Email format validation passing?
2. Database column exists?
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'users'
   AND column_name = 'newsletter_delivery_email';
   ```
3. RLS policies allow update?
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### Wrong Email Receiving Newsletters

**Debug:**
1. Check user's current setting in database
2. Verify API is using correct logic: `newsletter_delivery_email || email`
3. Check Resend API call logs
4. Ensure user hasn't set newsletter_delivery_email to someone else's email

## API Reference

### Update Newsletter Delivery Email

**Endpoint:** User update (via Settings page)

**Request:**
```typescript
await supabase
  .from('users')
  .update({
    newsletter_delivery_email: 'custom@example.com' // or NULL for login email
  })
  .eq('id', userId)
```

**Response:**
```json
{
  "status": 200,
  "message": "Settings saved successfully!"
}
```

### Fetch Newsletter Delivery Email

**Request:**
```typescript
const { data } = await supabase
  .from('users')
  .select('email, newsletter_delivery_email')
  .eq('id', userId)
  .single()

const deliveryEmail = data.newsletter_delivery_email || data.email
```

## Security Considerations

### Privacy

- Newsletter delivery email is private (protected by RLS)
- Users can only see/update their own delivery email
- No validation that email belongs to user (by design - allows team collaboration)

### Spam Prevention

- Email validation prevents obviously malformed addresses
- Rate limiting on newsletter sending (Resend API limits)
- User must be authenticated to set delivery email

### Data Protection

- Email stored in encrypted database
- HTTPS enforced for all API calls
- Supabase RLS policies prevent unauthorized access

## Summary

This feature provides users with flexibility in how they receive newsletter drafts:
- ✅ Simple default behavior (use login email)
- ✅ Easy to configure during onboarding
- ✅ Can be changed anytime in settings
- ✅ Supports team collaboration and email migration
- ✅ Validated and secure
- ✅ Works seamlessly with existing newsletter system

Users now have full control over where their valuable newsletter drafts are delivered!
