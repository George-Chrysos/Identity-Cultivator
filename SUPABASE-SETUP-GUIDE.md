# 🔐 Complete Supabase + Google Authentication Setup Guide

## ✅ Prerequisites Checklist
- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Google Cloud project created at [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Vercel project deployed (or your deployment platform)

---

## 📋 Step-by-Step Setup

### **PART 1: Supabase Project Setup**

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `identity-cultivator` (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. ⏳ Wait 2-3 minutes for database provisioning

#### 1.2 Get Your Supabase Credentials
1. Once project is ready, go to **Project Settings** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. Copy these values:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```
4. **Save these** - you'll need them later!

#### 1.3 Run Database Schema
1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `database/supabase-schema.sql` from your project
4. Copy **ALL** the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter)
7. ✅ You should see "Success. No rows returned"

---

### **PART 2: Google OAuth Setup**

#### 2.1 Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one):
   - Click project dropdown at top
   - Click **"New Project"**
   - Name it: `Identity Cultivator`
   - Click **"Create"**

#### 2.2 Enable Google+ API
1. In Google Cloud Console, click **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

#### 2.3 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in **required fields**:
   - **App name**: `Identity Cultivator`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes** page: Click **"Save and Continue"** (default scopes are fine)
7. **Test users** page: Click **"Save and Continue"**
8. Click **"Back to Dashboard"**

#### 2.4 Create OAuth Credentials
1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Choose **"Web application"**
4. **Name**: `Identity Cultivator Web Client`
5. **Authorized JavaScript origins**: Add these:
   ```
   http://localhost:5173
   https://your-project-name.vercel.app
   ```
6. **Authorized redirect URIs**: Add these:
   ```
   https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   http://localhost:5173/
   https://your-project-name.vercel.app/
   ```
   
   ⚠️ **IMPORTANT**: Replace `xxxxxxxxxxxxx.supabase.co` with YOUR Supabase Project URL!
   
   The Supabase callback URL format is:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```

7. Click **"Create"**
8. **Copy** the **Client ID** and **Client Secret** that appear
9. Click **"OK"**

---

### **PART 3: Connect Google to Supabase**

#### 3.1 Configure Google Provider in Supabase
1. In your Supabase project, go to **"Authentication"** in the left sidebar
2. Click **"Providers"** tab
3. Find **"Google"** in the list
4. Toggle it **ON** (enable it)
5. Paste your Google credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Click **"Save"**

#### 3.2 Configure Site URL and Redirect URLs
1. Still in **Authentication**, click **"URL Configuration"** tab
2. Set **Site URL**: 
   ```
   https://your-project-name.vercel.app
   ```
3. Add **Redirect URLs** (one per line):
   ```
   http://localhost:5173/**
   https://your-project-name.vercel.app/**
   ```
4. Click **"Save"**

---

### **PART 4: Configure Your Project**

#### 4.1 Local Development (.env file)
1. In your project root, create a file named `.env`
2. Add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```
3. Replace with YOUR actual values from Supabase
4. Save the file
5. ⚠️ **Never commit this file to git!** (it's already in .gitignore)

#### 4.2 Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add TWO variables:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxxxxxxxxxx.supabase.co` (your Supabase URL)
   - **Environments**: Check Production, Preview, Development

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
   - **Environments**: Check Production, Preview, Development

4. Click **"Save"**

#### 4.3 Redeploy on Vercel
After adding environment variables, you **MUST** redeploy:

**Option A: Redeploy from Vercel Dashboard**
1. Go to your project's **Deployments** tab
2. Click on the latest deployment
3. Click the **three dots** menu (⋯)
4. Click **"Redeploy"**
5. Confirm

**Option B: Push a new commit**
```bash
git add .
git commit -m "Configure Supabase environment variables"
git push
```

---

### **PART 5: Testing**

#### 5.1 Test Locally
1. Make sure your `.env` file has the correct credentials
2. Stop your dev server (Ctrl+C)
3. Start it again:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`
5. Click **"Login"** button
6. You should see the Google sign-in page
7. Sign in with your Google account
8. You should be redirected back to your app ✅

#### 5.2 Test on Production
1. Go to your deployed Vercel URL: `https://your-project.vercel.app`
2. Click **"Login"**
3. Sign in with Google
4. Should work! ✅

---

## 🐛 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch" Error
**Cause**: Your redirect URI in Google Cloud doesn't match what Supabase is sending.

**Solution**:
1. Check the error message - it shows the actual redirect URI being used
2. Copy that exact URI
3. Add it to Google Cloud Console > Credentials > Your OAuth Client > Authorized redirect URIs
4. Make sure it's EXACTLY: `https://your-ref.supabase.co/auth/v1/callback`

### Issue 2: "placeholder.supabase.co" DNS Error
**Cause**: Environment variables not set or not loaded.

**Solution**:
- **Local**: Make sure `.env` file exists and has correct values
- **Vercel**: 
  1. Check environment variables are set in Vercel dashboard
  2. Redeploy after adding them (they don't auto-apply!)
  3. Clear your browser cache

### Issue 3: Login Button Doesn't Work
**Cause**: Check browser console for errors.

**Solution**:
```bash
# Restart your dev server to load new .env variables
npm run dev
```

### Issue 4: Stuck on Auth Callback Page
**Cause**: Site URL or Redirect URLs misconfigured in Supabase.

**Solution**:
1. In Supabase: **Authentication** > **URL Configuration**
2. Make sure Site URL matches your deployed URL exactly
3. Add both localhost and production URLs to Redirect URLs:
   ```
   http://localhost:5173/**
   https://your-app.vercel.app/**
   ```

### Issue 5: Works Locally but Not in Production
**Cause**: Environment variables not set in Vercel.

**Solution**:
1. Double-check Vercel environment variables
2. Make sure they're set for "Production" environment
3. **Redeploy** after adding variables

---

## ✅ Verification Checklist

Go through this checklist to make sure everything is configured:

### Supabase
- [ ] Project created and database is ready
- [ ] SQL schema executed successfully
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] Google provider enabled in Authentication
- [ ] Google Client ID and Secret added
- [ ] Site URL configured in URL Configuration
- [ ] Redirect URLs added (localhost + production)

### Google Cloud
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added (including Supabase callback)
- [ ] Client ID and Secret copied to Supabase

### Your Project
- [ ] `.env` file created locally with credentials
- [ ] Environment variables added to Vercel
- [ ] Redeployed after adding variables
- [ ] Tested login locally ✅
- [ ] Tested login on production ✅

---

## 🔍 Debug Commands

If something isn't working, check these:

### Check if environment variables are loaded:
```bash
# Run your dev server and add this to src/lib/supabase.ts temporarily:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has anon key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Should show your actual Supabase URL, not "placeholder.supabase.co"

### Check Supabase connection:
Open browser console on your site and run:
```javascript
console.log(window.location.origin);
```
This shows what redirectTo URL is being used.

---

## 📞 Still Having Issues?

1. **Check browser console** for error messages
2. **Check Supabase logs**: Dashboard > Logs > API
3. **Verify ALL URLs match exactly** (no trailing slashes, correct protocol)
4. **Make sure you redeployed** after adding environment variables

---

## 🎉 Success!

Once everything is working:
- ✅ Users can sign in with Google
- ✅ Data is stored in Supabase PostgreSQL database
- ✅ Authentication persists across sessions
- ✅ Multi-device sync works
- ✅ Production-ready!

Your Identity Cultivator app is now fully authenticated and cloud-powered! 🚀
