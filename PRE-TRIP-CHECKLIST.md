# ✅ Pre-Deployment Checklist

Complete these steps before your business trip tomorrow night!

## 🎯 Phase 1: Supabase Setup (15 minutes)

### Create Project
- [ ] Go to https://supabase.com and sign in
- [ ] Create new project named "cultivator-system"
- [ ] Choose closest region
- [ ] Save database password somewhere safe
- [ ] Wait ~2 minutes for project creation

### Setup Database
- [ ] Go to SQL Editor in Supabase
- [ ] Open `database/supabase-schema.sql` file
- [ ] Copy ALL SQL code
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify: ✅ Success message appears

### Get API Credentials  
- [ ] Go to Settings → API
- [ ] Copy "Project URL" (looks like: https://xxx.supabase.co)
- [ ] Copy "anon public" key (long JWT token)
- [ ] Save these somewhere safe!

---

## 🔐 Phase 2: Google OAuth (15 minutes)

### Google Cloud Console
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project or select existing
- [ ] Go to APIs & Services → OAuth consent screen
  - [ ] Choose "External" user type
  - [ ] App name: "Cultivator System"
  - [ ] Add your email as support + developer email
  - [ ] Save and Continue through all steps

### Create OAuth Credentials
- [ ] Go to Credentials → Create Credentials → OAuth 2.0 Client ID
- [ ] Application type: "Web application"
- [ ] Name: "Cultivator Web Client"
- [ ] Authorized redirect URIs:
  - [ ] Add: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
  - [ ] Replace YOUR_SUPABASE_PROJECT_ID with actual ID from Supabase
- [ ] Click Create
- [ ] Copy "Client ID" and "Client Secret"

### Configure in Supabase
- [ ] Back in Supabase: Authentication → Providers
- [ ] Find "Google" and toggle ON
- [ ] Paste Client ID
- [ ] Paste Client Secret
- [ ] Click Save

---

## 💻 Phase 3: Local Configuration (5 minutes)

### Update Environment Variables
- [ ] Open `.env` file in project root
- [ ] Replace `VITE_SUPABASE_URL` with your Supabase URL
- [ ] Replace `VITE_SUPABASE_ANON_KEY` with your anon key
- [ ] Save file

### Test Locally
```powershell
npm install
npm run dev
```
- [ ] App opens at http://localhost:5173
- [ ] Click "Sign in with Google"
- [ ] Successfully logs in with your Google account
- [ ] Create a test identity
- [ ] Mark a task as complete
- [ ] Open calendar view
- [ ] Data persists after refresh

**If any step fails, check browser console (F12) for errors**

---

## ☁️ Phase 4: Deploy to Vercel (10 minutes)

### Prepare Project
```powershell
npm run build
```
- [ ] Build completes without errors
- [ ] `dist` folder is created

### Deploy

#### Option A: Vercel CLI (Faster)
```powershell
npm install -g vercel
vercel login
vercel
```
- [ ] Follow prompts (accept defaults)
- [ ] Deployment URL received

#### Option B: Vercel Website
- [ ] Push code to GitHub first
- [ ] Go to https://vercel.com
- [ ] Import repository
- [ ] Configure build:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variables:
  - [ ] `VITE_SUPABASE_URL` = your URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = your key
- [ ] Click Deploy
- [ ] Wait 2-3 minutes

### Update OAuth
- [ ] Copy your Vercel URL (e.g., https://cultivator-xxx.vercel.app)
- [ ] Go back to Google Cloud Console → Credentials
- [ ] Edit OAuth Client
- [ ] Add Vercel URL to Authorized redirect URIs
- [ ] Save

---

## 🧪 Phase 5: Production Testing (10 minutes)

Visit your deployed app and test:

### Authentication
- [ ] Google login works
- [ ] Profile picture shows
- [ ] Name displays correctly
- [ ] Sign out works

### Core Features
- [ ] Create new identity
- [ ] Complete daily task
- [ ] Task marked as done
- [ ] Progress bar updates
- [ ] Streak counter increases
- [ ] Calendar opens
- [ ] Past dates can be toggled
- [ ] Data persists after logout/login

### Mobile Test
- [ ] Open on your phone
- [ ] Login works
- [ ] Calendar view is responsive
- [ ] Cards display correctly
- [ ] Touch interactions work

---

## 🌐 Phase 6: Domain (Optional - 15 minutes)

### Buy Domain
- [ ] Go to Namecheap/Google Domains/Cloudflare
- [ ] Search for available domain
- [ ] Purchase (usually $10-15/year)

### Connect to Vercel
- [ ] Vercel Dashboard → Project → Settings → Domains
- [ ] Add your domain
- [ ] Copy DNS records shown
- [ ] Add DNS records in domain registrar
- [ ] Wait 10-60 minutes for propagation
- [ ] Verify HTTPS certificate is active

### Update OAuth Again
- [ ] Google Cloud Console → Credentials
- [ ] Add custom domain to redirect URIs
- [ ] Save

---

## 📱 Phase 7: Share with Beta Testers

### Prepare Message
```
Hey! I've built a personal development app and would love your feedback.

🌟 Cultivator System v0.1 Beta
Track daily habits with gamification, streaks, and leveling!

📱 Try it here: [YOUR_URL]
🔐 Sign in with Google (secure via Google OAuth)

What to test:
- Create an identity (your choice of path)
- Complete daily tasks
- Check out the calendar view
- Build a streak!

⏱️ Takes 2 minutes to start, then 30 seconds daily
💬 Let me know any bugs or suggestions!

This is an early beta - expect some rough edges 🙂
```

### Send to Testers
- [ ] Share URL via email/WhatsApp/Slack
- [ ] Include brief instructions
- [ ] Ask for feedback on:
  - [ ] Ease of use
  - [ ] Mobile experience
  - [ ] Any bugs/errors
  - [ ] Feature requests

---

## 🎉 You're Ready!

### Before Your Trip
- [ ] App is deployed and working
- [ ] Multiple devices tested
- [ ] Beta testers have access
- [ ] Monitoring dashboard bookmarked:
  - Vercel: https://vercel.com/dashboard
  - Supabase: https://supabase.com/dashboard

### During Your Trip
- **The app runs automatically** - no maintenance needed!
- Check Vercel dashboard for any deployment issues
- Check Supabase dashboard for database metrics
- Respond to beta tester feedback when you can

### Troubleshooting Resources
- Browser console (F12) shows client errors
- Supabase Logs show database errors
- Vercel Logs show deployment errors
- Full guide: DEPLOYMENT-GUIDE.md

---

## 📊 Success Metrics

After 1 week, check:
- [ ] Number of beta testers who signed up
- [ ] Total identities created
- [ ] Average daily completions
- [ ] Longest streak achieved
- [ ] User feedback themes

---

## 🚨 Emergency Contacts

If something breaks:
1. Check browser console (F12)
2. Check Supabase Logs
3. Check Vercel Deployment Logs
4. Review DEPLOYMENT-GUIDE.md
5. Revert to previous deployment in Vercel if needed

---

**Estimated Total Time:** ~60-75 minutes

**Cost:** $0 (or $10-15 if you buy a domain)

**Have a great trip! Your app will keep running while you're away! 🚀✈️**
