# ⚠️ CRITICAL FIX: Environment Variables Not Loading in Vercel

## The Problem
Your app is using `placeholder.supabase.co` even though you set environment variables in Vercel. This means the variables are **NOT being injected at build time**.

## Why This Happens
Vite's `import.meta.env` only works with variables that:
1. Start with `VITE_` prefix ✅ (you have this)
2. Are present at **BUILD TIME** ❌ (this is the issue)

Vercel doesn't automatically inject env vars into the client bundle - they need to be baked in during the build.

---

## 🔧 SOLUTION: Force Environment Variables at Build Time

### Step 1: Update Vite Config

Replace your `vite.config.ts` with this:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ],
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
})
```

### Step 2: Verify Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Make sure you have EXACTLY:

**Variable 1:**
```
Key: VITE_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 3: Commit and Push
```bash
git add vite.config.ts
git commit -m "Fix: Force environment variables at build time"
git push
```

This will trigger a new deployment with the fix.

---

## 🎯 Alternative Solution: Use Vercel System Environment Variables

If the above doesn't work, Vercel has a separate way to handle this.

### Update your `vite.config.ts` to:

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: '/src' }
      ],
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    },
  }
})
```

---

## 🔍 Debug: Check What Vercel Is Building With

Add this to your build command temporarily to see what's available:

### In Vercel:
Settings → General → Build & Development Settings

**Build Command:**
```bash
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" && npm run build
```

This will show you in the build logs if the variable is available.

---

## 🚨 Nuclear Option: Hardcode for Testing

**ONLY FOR TESTING** - Not recommended for production!

Temporarily hardcode your values in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-actual-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-actual-anon-key-here';
```

This will prove if the issue is environment variables or something else.

If this works, then definitely the issue is env vars not loading.

---

## ✅ Verification Steps

After deploying the fix:

1. Go to your Vercel deployment logs
2. Look for the build output
3. Check if you see any environment variable warnings
4. Open your deployed site
5. Open DevTools → Console
6. Type: `import.meta.env`
7. You should see your variables listed

---

## 🎯 Most Likely Root Cause

Vercel's environment variables are **not automatically injected into Vite's client bundle**. You need to explicitly define them in `vite.config.ts` using the `define` option, which replaces the values at build time.

This is different from Next.js which does this automatically!

---

## 📞 Still Not Working?

Try this debugging approach:

1. **Create a `.env` file locally** (for testing):
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```

2. **Test locally**:
   ```bash
   npm run dev
   ```
   
   If it works locally but not in Vercel, it's definitely a Vercel environment variable injection issue.

3. **Check Vercel Build Logs**:
   - Go to your deployment in Vercel
   - Click on it
   - Check the "Building" step logs
   - Look for any environment variable related errors

---

## 🔐 Security Note

Never commit your actual Supabase credentials to git. The `.env` file should only be for local testing and should be in `.gitignore`.

For production, ALWAYS use Vercel environment variables with the vite.config.ts fix above.
