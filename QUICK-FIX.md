# 🔍 Quick Troubleshooting - "placeholder.supabase.co" Error

## Your Current Issue
When clicking Login, you're redirected to `placeholder.supabase.co` which causes a DNS error.

## Root Cause
The environment variables are not being loaded in your deployed app.

---

## ✅ Quick Fix Checklist

### Step 1: Verify Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Check if you have these TWO variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**If they're missing:**
- Add them now (see main guide for values)
- **CRITICAL**: After adding variables, you MUST redeploy!

**If they exist:**
- Make sure they're checked for "Production" environment
- Make sure the values are correct (not placeholders)
- Redeploy anyway (variables need a fresh deployment to apply)

### Step 2: Redeploy Your Project
**Environment variables only take effect on NEW deployments!**

Go to Vercel:
1. **Deployments** tab
2. Click latest deployment
3. Click **three dots** (⋯)
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Step 3: Clear Cache & Test
1. Go to your deployed URL
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Click Login
4. Should now redirect to Google, not placeholder! ✅

---

## 🔍 Detailed Verification

### Check #1: Local Works, Production Doesn't?
This confirms it's an environment variable issue.

**Solution**: Make sure variables are set in Vercel for "Production" environment.

### Check #2: See "placeholder.supabase.co" in Console?
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for the warning:
   ```
   Supabase credentials not configured. Using local storage mode.
   ```

If you see this, environment variables aren't loaded!

### Check #3: Verify Variables Are Correct
Your Supabase URL should look like:
```
https://abcdefghijklmnop.supabase.co
```
**Not**:
- ❌ `your_supabase_project_url_here`
- ❌ `https://placeholder.supabase.co`
- ❌ `https://supabase.co`

Your anon key should be a long JWT token starting with:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Not**:
- ❌ `your_supabase_anon_key_here`
- ❌ `placeholder-key`

---

## 🎯 Most Likely Issues

### Issue #1: Variables Not Set in Vercel (90% of cases)
**Fix**: Add them in Vercel Settings > Environment Variables, then redeploy

### Issue #2: Variables Set but Not Redeployed (9% of cases)
**Fix**: Just redeploy your project in Vercel

### Issue #3: Variables Have Wrong Values (1% of cases)
**Fix**: Get correct values from Supabase Dashboard > Settings > API

---

## 📸 Visual Guide to Environment Variables

### Where to Get Supabase Values:
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **Settings** (gear icon) in left sidebar
4. Click **API**
5. Look for:
   ```
   Project URL: https://xxxxx.supabase.co  ← Copy this
   
   Project API keys:
   anon public: eyJhbGci... ← Copy this (the long one)
   ```

### Where to Put Them in Vercel:
```
Vercel Dashboard
  └─ Your Project
      └─ Settings
          └─ Environment Variables
              └─ Add Variable
                  Name: VITE_SUPABASE_URL
                  Value: https://xxxxx.supabase.co
                  Environment: ✓ Production ✓ Preview ✓ Development
                  
              └─ Add Variable
                  Name: VITE_SUPABASE_ANON_KEY  
                  Value: eyJhbGci...
                  Environment: ✓ Production ✓ Preview ✓ Development
```

---

## 🧪 Test After Each Step

After redeploying:
1. Go to your Vercel URL
2. Open DevTools (F12)
3. Go to Console tab
4. Click Login button
5. Check console for errors

**Success looks like:**
- Google OAuth page loads
- No "placeholder.supabase.co" errors
- No DNS errors

**Still failing?**
- Check console for exact error message
- Verify variables are EXACTLY correct (no spaces, no typos)
- Make sure you checked all three environments (Production, Preview, Development)

---

## 🚀 After It's Working

Once login works, make sure to:
1. Test creating an identity
2. Test completing daily tasks
3. Check if data persists after logout/login
4. Verify everything syncs correctly

---

## Need More Help?

See the full guide: `SUPABASE-SETUP-GUIDE.md`

Or check the Supabase logs:
1. Supabase Dashboard
2. Click "Logs" in sidebar
3. Select "API" logs
4. Look for authentication errors
