# 🔐 Google OAuth Setup Guide

## ✅ What's Implemented

CreatorPulse now supports **Google OAuth authentication**. Users can sign in or sign up using their Google account.

---

## 1. 📋 Prerequisites

Before setting up Google OAuth, you need:
- A Google Cloud Platform account
- A Supabase project
- Your app deployed (or use localhost for development)

---

## 2. 🚀 Step-by-Step Setup

### Step 1: Create Google OAuth Client

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Click the project dropdown at the top
   - Click "New Project" or select existing project
   - Name: "CreatorPulse" (or your app name)
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for public app) or "Internal" (for organization only)
   - Click "Create"

   **Fill in the form:**
   - **App name:** CreatorPulse
   - **User support email:** your-email@example.com
   - **App logo:** (optional, upload your logo)
   - **Application home page:** https://your-app.vercel.app
   - **Application privacy policy link:** https://your-app.vercel.app/privacy
   - **Application terms of service link:** https://your-app.vercel.app/terms
   - **Authorized domains:**
     - your-app.vercel.app
     - your-supabase-project.supabase.co
   - **Developer contact email:** your-email@example.com

   Click "Save and Continue"

5. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - Select:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

6. **Add Test Users (if using External):**
   - Add your email and other test users
   - Click "Save and Continue"

7. **Review and Create:**
   - Review your settings
   - Click "Back to Dashboard"

8. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - **Application type:** Web application
   - **Name:** CreatorPulse Web Client

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://your-app.vercel.app/auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```

   Click "Create"

9. **Save Your Credentials:**
   - Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-abc123def456`)

   **⚠️ Important:** Keep these secret! Never commit them to GitHub.

---

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com/
   - Select your project

2. **Navigate to Authentication Settings:**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list

3. **Enable Google Provider:**
   - Toggle "Enable" to ON
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console

4. **Configure Callback URL:**
   - Supabase shows you the callback URL automatically
   - Should look like: `https://your-project.supabase.co/auth/v1/callback`
   - **Make sure this URL is in your Google OAuth "Authorized redirect URIs"**

5. **Additional Settings (optional):**
   - **Skip nonce check:** Leave OFF (more secure)
   - **Allowed redirect URLs:** Add your app URLs:
     ```
     http://localhost:3000/auth/callback
     https://your-app.vercel.app/auth/callback
     ```

6. **Save Changes:**
   - Click "Save"

---

### Step 3: Verify Configuration

1. **Check Authorized Domains in Google:**
   - Go back to Google Cloud Console
   - "OAuth consent screen" → "Edit App"
   - Verify authorized domains include:
     - `your-app.vercel.app`
     - `your-supabase-project.supabase.co`

2. **Check Redirect URIs in Google:**
   - Go to "Credentials" → Click your OAuth Client
   - Verify "Authorized redirect URIs" include:
     ```
     http://localhost:3000/auth/callback
     https://your-app.vercel.app/auth/callback
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```

---

## 3. 🧪 Testing Google OAuth

### Local Development (localhost:3000)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

3. **Click "Sign in with Google":**
   - Should redirect to Google sign-in page
   - Select your Google account
   - Grant permissions
   - Should redirect back to your app at `/auth/callback`
   - Then redirect to `/dashboard`

4. **Check Supabase Dashboard:**
   - Go to "Authentication" → "Users"
   - Verify new user created with Google provider

### Production (Vercel)

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add Google OAuth"
   git push origin main
   ```

2. **Test on production URL:**
   ```
   https://your-app.vercel.app/login
   ```

3. **Click "Sign in with Google":**
   - Same flow as local development
   - Should work seamlessly

---

## 4. 🔄 How Google OAuth Works

### User Flow

```
User clicks "Sign in with Google"
    ↓
signInWithGoogle() called
    ↓
Redirects to Google OAuth consent screen
    ↓
User selects Google account
    ↓
User grants permissions (email, profile)
    ↓
Google redirects to Supabase callback URL
    ↓
Supabase exchanges code for session
    ↓
Supabase redirects to /auth/callback in your app
    ↓
Your callback handler exchanges code for session
    ↓
Redirects to /onboarding (new user) or /dashboard (existing)
    ↓
User is now authenticated!
```

### Technical Flow

**1. User clicks "Sign in with Google":**
```typescript
const handleGoogleSignIn = async () => {
  const { error } = await signInWithGoogle()
  // Automatically redirects to Google
}
```

**2. signInWithGoogle() implementation:**
```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  return { data, error }
}
```

**3. Google redirects to Supabase:**
```
https://your-supabase-project.supabase.co/auth/v1/callback?code=abc123
```

**4. Supabase exchanges code and redirects to your app:**
```
https://your-app.vercel.app/auth/callback?code=def456
```

**5. Your callback handler:**
```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect('/dashboard')
  }

  return NextResponse.redirect('/auth/auth-code-error')
}
```

---

## 5. 👤 User Profile Creation

### Automatic Profile Creation

When a user signs in with Google for the first time, Supabase creates an auth user and your database trigger automatically creates a profile:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Google User Metadata

Google OAuth provides:
```json
{
  "email": "user@gmail.com",
  "email_verified": true,
  "full_name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "provider_id": "1234567890",
  "sub": "1234567890"
}
```

This is stored in `auth.users.raw_user_meta_data` and can be accessed:
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log(user.user_metadata.full_name) // "John Doe"
console.log(user.user_metadata.avatar_url) // Google profile picture
```

### Display Name Priority

Your trigger uses this priority for display_name:
1. `raw_user_meta_data->>'full_name'` (from Google)
2. `raw_user_meta_data->>'display_name'` (from manual signup)
3. `email` (fallback)

---

## 6. 🔐 Security Considerations

### ✅ What's Already Secure

1. **PKCE Flow:**
   - Supabase uses PKCE (Proof Key for Code Exchange)
   - Protects against authorization code interception
   - Automatically handled by `@supabase/ssr`

2. **State Parameter:**
   - Prevents CSRF attacks
   - Automatically handled by Supabase

3. **Secure Cookies:**
   - Session stored in httpOnly, secure cookies
   - Not accessible via JavaScript
   - Auto-refresh on expiry

4. **Email Verification:**
   - Google verifies email ownership
   - `email_verified: true` in user metadata
   - No need for additional email confirmation

### 🔒 Additional Security Tips

1. **Verify Email in Your App:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user.user_metadata.email_verified) {
     // Show warning or require additional verification
   }
   ```

2. **Rate Limit OAuth Attempts:**
   - Enable rate limiting in Supabase Dashboard
   - Settings → Rate Limits
   - Limit: 5 attempts per minute per IP

3. **Monitor OAuth Events:**
   ```typescript
   supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'SIGNED_IN' && session?.user.app_metadata.provider === 'google') {
       console.log('User signed in with Google:', session.user.email)
       // Send to analytics or logging service
     }
   })
   ```

4. **Restrict to Specific Domains (optional):**
   - In Google Cloud Console
   - OAuth consent screen → Authorized domains
   - Only allow your domain

---

## 7. 🐛 Troubleshooting

### Error: "Redirect URI mismatch"

**Cause:** The redirect URI in your request doesn't match what's configured in Google Cloud Console.

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Click your OAuth Client
3. Add the exact URL to "Authorized redirect URIs":
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
4. Save and wait 5 minutes for changes to propagate

### Error: "Access blocked: This app's request is invalid"

**Cause:** Authorized domains not configured in OAuth consent screen.

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Edit app
3. Add "Authorized domains":
   ```
   your-app.vercel.app
   your-supabase-project.supabase.co
   ```
4. Save

### Error: "Invalid OAuth2 credentials"

**Cause:** Client ID or Client Secret incorrect in Supabase.

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Copy Client ID and Client Secret again
3. Go to Supabase Dashboard → Authentication → Providers
4. Update Google credentials
5. Save

### Google sign-in button doesn't work

**Cause:** Google provider not enabled in Supabase.

**Fix:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Google"
3. Toggle "Enable" to ON
4. Add Client ID and Client Secret
5. Save

### User redirected to error page after Google sign-in

**Cause:** Callback URL not in allowed redirect URLs.

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Allowed redirect URLs":
   ```
   http://localhost:3000/auth/callback
   https://your-app.vercel.app/auth/callback
   ```
3. Save

### Error: "The OAuth client was not found"

**Cause:** OAuth Client deleted or credentials changed.

**Fix:**
1. Create new OAuth client in Google Cloud Console
2. Update credentials in Supabase
3. Redeploy app if needed

---

## 8. 📱 OAuth Consent Screen States

### Development (Testing)

**Status:** "Testing"

- **User limit:** 100 test users
- **Availability:** Only test users can sign in
- **Consent screen:** Shows "This app isn't verified" warning
- **Good for:** Development and testing

**To add test users:**
1. Go to OAuth consent screen
2. Add test users' emails
3. They can now sign in during testing

### Production (Published)

**Status:** "In production"

- **User limit:** Unlimited
- **Availability:** Public, anyone can sign in
- **Consent screen:** No warning (if verified)
- **Verification:** Required for sensitive scopes

**To publish:**
1. Go to OAuth consent screen
2. Click "Publish App"
3. Confirm

**⚠️ Note:** For basic scopes (email, profile), verification is optional but recommended.

---

## 9. 🎨 UI Customization

### Change Button Style

The Google button uses your existing UI components. To customize:

**Login page** (`app/(auth)/login/page.tsx`):
```tsx
<Button
  type="button"
  variant="outline"  // Change variant
  className="w-full mt-4 hover:bg-primary/5"  // Custom styles
  onClick={handleGoogleSignIn}
>
  <Chrome className="h-4 w-4 mr-2" />
  Sign in with Google
</Button>
```

### Use Google's Brand Guidelines

Google has official guidelines for the "Sign in with Google" button:
- https://developers.google.com/identity/branding-guidelines

**Official Google icon:**
```bash
npm install @react-icons/all-files
```

```tsx
import { FcGoogle } from '@react-icons/all-files/fc/FcGoogle'

<Button ...>
  <FcGoogle className="h-5 w-5 mr-2" />
  Continue with Google
</Button>
```

### Add More OAuth Providers

Want to add GitHub, Twitter, etc.?

**In Supabase:**
1. Go to Authentication → Providers
2. Enable desired provider
3. Add credentials from provider (GitHub, Twitter, etc.)

**In your code:**
```typescript
// lib/hooks/use-auth.ts
const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}
```

**Add button:**
```tsx
<Button onClick={handleGitHubSignIn}>
  <Github className="h-4 w-4 mr-2" />
  Sign in with GitHub
</Button>
```

---

## 10. 📊 Analytics & Monitoring

### Track OAuth Sign-ins

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    const provider = session?.user.app_metadata.provider
    const email = session?.user.email

    // Send to analytics
    if (provider === 'google') {
      console.log('Google OAuth sign-in:', email)
      // analytics.track('oauth_signin', { provider: 'google', email })
    }
  }
})
```

### Monitor OAuth Errors

```typescript
const handleGoogleSignIn = async () => {
  try {
    const { error } = await signInWithGoogle()

    if (error) {
      // Log error to monitoring service
      console.error('Google OAuth error:', error)
      // errorTracking.log(error)
      toast.error(error.message)
    }
  } catch (error) {
    // Log unexpected errors
    console.error('Unexpected OAuth error:', error)
    // errorTracking.log(error)
  }
}
```

---

## 11. ✅ Checklist

Before going live with Google OAuth:

### Google Cloud Console
- [ ] Created OAuth Client ID
- [ ] Configured OAuth consent screen
- [ ] Added authorized domains
- [ ] Added authorized redirect URIs (both app and Supabase)
- [ ] Published app (or added test users)
- [ ] Enabled Google+ API

### Supabase Dashboard
- [ ] Enabled Google provider
- [ ] Added Client ID and Client Secret
- [ ] Verified callback URL
- [ ] Added allowed redirect URLs

### Your Application
- [ ] Added Google sign-in buttons to login and signup pages
- [ ] Tested OAuth flow locally
- [ ] Tested OAuth flow in production
- [ ] User profile creation works automatically
- [ ] Error handling in place
- [ ] Loading states implemented

### Security
- [ ] Using HTTPS in production
- [ ] Redirect URIs use HTTPS (not HTTP)
- [ ] Client Secret not exposed in client-side code
- [ ] Rate limiting enabled in Supabase
- [ ] Monitoring OAuth events

---

## 12. 🎉 Summary

### What's Working Now

✅ **Google OAuth implemented:**
- "Sign in with Google" button on login page
- "Sign up with Google" button on signup page
- Automatic redirect to Google consent screen
- Automatic profile creation on first sign-in
- Session management via cookies
- Secure PKCE flow

✅ **User Experience:**
- One-click sign-in/sign-up
- No password to remember
- Profile picture from Google
- Email verification automatic
- Seamless onboarding flow

✅ **Security:**
- PKCE flow prevents code interception
- State parameter prevents CSRF
- Secure httpOnly cookies
- Email verified by Google
- Row Level Security (RLS) enforced

### Next Steps

1. **Set up Google OAuth credentials** (follow steps above)
2. **Test locally** with your Google account
3. **Deploy to production** and test again
4. **Add test users** if using OAuth consent screen in "Testing" mode
5. **Publish app** when ready for public use

### Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all URLs match exactly (no trailing slashes)
3. Wait 5 minutes after changing Google settings
4. Check Supabase logs: Dashboard → Logs → Auth Logs
5. Check browser console for errors

**Google OAuth is now ready to use!** 🚀
