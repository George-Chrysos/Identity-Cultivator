# 🚀 Complete Deployment Guide - Cultivator System v0.1

## 📋 Overview
This guide will help you deploy your Cultivator app to the cloud with:
- **Frontend:** Vercel (FREE)
- **Database:** Supabase (FREE tier)
- **Authentication:** Google OAuth via Supabase (FREE)
- **Domain:** Optional ($10-15/year)

**Total Setup Time:** ~30-45 minutes  
**Total Cost:** $0 (or $10-15/year with custom domain)

---

## 🗂️ Part 1: Supabase Setup (Database + Auth)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign in with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name:** `cultivator-system` (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Open the file: `database/supabase-schema.sql` from your project
3. Copy **ALL** the SQL code
4. Paste it into the SQL Editor in Supabase
5. Click **"Run"** (bottom right)
6. You should see: ✅ Success. No rows returned

### Step 3: Configure Google OAuth

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle it **ON**
4. You'll need Google OAuth credentials:

#### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Cultivator System`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through all steps
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Cultivator Web Client`
   - **Authorized redirect URIs:** `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     - Replace YOUR_PROJECT_ID with your actual Supabase project ID
     - You can find this in Supabase: Settings → API → Project URL
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

#### Back in Supabase:
1. Paste **Client ID** into Supabase Google provider
2. Paste **Client Secret** into Supabase Google provider
3. Click **Save**

### Step 4: Get Supabase API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (the long JWT token)
3. Keep these handy for the next part!

---

## 🔧 Part 2: Configure Your Local Project

### Step 1: Update Environment Variables

1. Open the file `.env` in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_long_anon_key_here
```

3. Save the file

### Step 2: Test Locally

```powershell
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

4. Open http://localhost:5173
5. Try signing in with Google
6. Create an identity and test task completion

---

## ☁️ Part 3: Deploy to Vercel

### Step 1: Prepare for Deployment

```powershell
# Build the project to check for errors
npm run build
```

If successful, you'll see a `dist` folder created.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Your account
- **Link to existing project?** N
- **Project name?** cultivator-system (or your choice)
- **Directory?** . (current directory)
- **Override settings?** N

#### Option B: Using Vercel Website
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository (push your code to GitHub first)
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Environment Variables** → Add these:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **"Deploy"**

### Step 3: Update Google OAuth Redirect

After deploying, you'll get a URL like: `https://cultivator-system.vercel.app`

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs:**
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` (already there)
   - `https://your-app.vercel.app/` (your Vercel URL)
5. Click **Save**

---

## 🌐 Part 4: Add Custom Domain (Optional)

### Step 1: Buy a Domain

Recommended registrars:
- **Namecheap** (~$10-15/year) - https://www.namecheap.com
- **Google Domains** (~$12/year) - https://domains.google
- **Cloudflare** (~$10/year) - https://www.cloudflare.com

### Step 2: Connect Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `cultivatorsystem.com`)
4. Vercel will show you DNS records to add
5. In your domain registrar, add the DNS records:
   - **Type:** A or CNAME
   - **Value:** From Vercel instructions
6. Wait 5-60 minutes for DNS propagation
7. Vercel will automatically enable HTTPS

### Step 3: Update OAuth Redirects Again

Add your custom domain to Google OAuth:
1. Google Cloud Console → Credentials
2. Add: `https://yourdomain.com/`
3. Save

---

## ✅ Part 5: Final Testing Checklist

Test these features on your deployed site:

- [ ] Google Login works
- [ ] Create a new identity
- [ ] Complete a task (mark as done)
- [ ] Calendar view opens and shows history
- [ ] Mark past dates as completed
- [ ] Streak counter updates
- [ ] Level progress shows correctly
- [ ] Data persists after logout/login
- [ ] Works on mobile browser
- [ ] Multiple users can sign in independently

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors
- Check that environment variables are set in Vercel
- Redeploy after adding environment variables
- Check Supabase URL is correct

### Google Login not working
- Verify redirect URI exactly matches in Google Console
- Check Google Client ID/Secret in Supabase
- Make sure OAuth consent screen is published

### Database errors
- Check RLS policies are enabled
- Verify SQL schema ran successfully
- Check browser console for specific errors

### Data not persisting
- Verify Supabase connection is working
- Check Network tab in browser DevTools
- Ensure user is authenticated

---

## 📱 Sharing with Beta Testers

Once deployed, share this link with testers:
- **URL:** `https://your-app.vercel.app` or `https://yourdomain.com`
- **Instructions:** "Sign in with Google and start creating your identities!"

**What to tell beta testers:**
- This is an early beta - data might be reset
- Report any bugs or UX issues
- Focus on: daily task completion, streak tracking, calendar view
- Test on mobile for best experience

---

## 💰 Cost Summary

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | FREE | 100GB bandwidth, unlimited sites |
| Supabase | Free | FREE | 500MB database, 2GB bandwidth, 50K monthly active users |
| Google OAuth | Free | FREE | Unlimited auth requests |
| Domain (optional) | Annual | $10-15/year | N/A |
| **TOTAL** | | **$0-15/year** | More than enough for beta! |

---

## 🚀 Next Steps After Beta

When you're ready to scale:
- Upgrade Supabase to Pro ($25/month) for 8GB database
- Add custom email templates for auth
- Set up analytics (Vercel Analytics - FREE)
- Add error monitoring (Sentry - FREE tier)
- Implement push notifications

---

## 📞 Support

If you run into issues:
1. Check browser console for errors (F12)
2. Check Supabase logs: Dashboard → Logs
3. Check Vercel deployment logs: Deployments → Click on deployment
4. Review this guide again - most issues are configuration

---

## 🎉 You're Done!

Your Cultivator System is now:
- ✅ Deployed to production
- ✅ Backed by a real database
- ✅ Secured with Google authentication
- ✅ Accessible from anywhere
- ✅ Ready for beta testing!

**Have a great business trip! Your app will keep running while you're away.** 🌟
