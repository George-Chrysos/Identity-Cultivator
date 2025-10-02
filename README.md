# 🌟 Cultivator Identity Evolution System

A gamified personal development platform that transforms your daily habits into a cultivation journey. Track multiple identities, build streaks, and evolve through tiers as you complete daily tasks.

**Current Version:** v0.1 Beta (Ready for deployment!)

## ✨ Features

### 🎮 Gamified Progress System
- Multi-tier evolution (D → C → B → A → S → SS → SSS)
- 10 levels per tier with dynamic requirements
- Visual progress tracking with beautiful animations
- Real-time streak tracking with fire indicators 🔥

### 📅 Interactive Calendar
- Track daily completions with full calendar view
- Edit past dates to maintain accurate history
- Visual indicators for completed, missed, and future days
- Responsive design for mobile and desktop

### 🎯 Multiple Identity Paths
- **Cultivator** - Spiritual/Mental growth
- **Bodysmith** - Physical fitness
- **Pathweaver** - Learning & Skills
- **Creative** - Artistic pursuits
- **Social** - Relationships & connections

### 🔐 Secure Authentication
- Google OAuth integration via Supabase
- Automatic profile creation
- Multi-device data synchronization
- Row Level Security (RLS) protection

### 💾 Cloud-Powered
- PostgreSQL database via Supabase
- Real-time data sync across devices
- Automatic backups and redundancy
- FREE tier supports thousands of users

## 🚀 Quick Start

### For Beta Testing (Just Use It!)
1. Visit the deployed URL (shared by admin)
2. Click "Sign in with Google"
3. Create your first identity
4. Start completing daily tasks!

### For Local Development

#### Prerequisites
- Node.js 18+ and npm
- Supabase account (free)
- Google Cloud account for OAuth (free)

#### Installation Steps

```bash
# 1. Clone and navigate
git clone <your-repo>
cd "System Educational App"

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Copy .env.example and configure
cp .env.example .env

# 4. Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your_project_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# 5. Run development server
npm run dev

# 6. Open browser
# Visit http://localhost:5173
```

### For Production Deployment

See **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** for complete step-by-step instructions!

**Quick summary:**
1. Create Supabase project (~5 min)
2. Setup Google OAuth (~10 min)
3. Deploy to Vercel (~5 min)
4. Optional: Add custom domain (~15 min)

**Total time:** ~30 minutes  
**Total cost:** $0 (or $10-15/year with custom domain)

## 📦 Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React 18 + TypeScript + Vite | Fast, type-safe, modern |
| **Styling** | Tailwind CSS | Utility-first, responsive |
| **Animations** | Framer Motion | Smooth, professional animations |
| **State** | Zustand | Simple, performant state management |
| **Database** | Supabase (PostgreSQL) | Scalable, real-time, FREE tier |
| **Auth** | Supabase Auth + Google OAuth | Secure, no password management |
| **Hosting** | Vercel | Zero-config, global CDN, FREE |
| **Icons** | Lucide React | Beautiful, consistent icons |

## 🏗️ Project Structure

```
src/
├── components/              # React components
│   ├── CultivatorCard.tsx        # Identity card with calendar
│   ├── GoogleAuth.tsx            # Google sign-in button
│   ├── Header.tsx                # Navigation with auth
│   └── ...
├── pages/                   # Page-level components
│   ├── Dashboard.tsx             # Main dashboard
│   ├── CultivatorHomepage.tsx    # Cultivator view
│   └── ...
├── store/                   # State management (Zustand)
│   ├── cultivatorStore.ts        # Main app state + logic
│   ├── authStore.ts              # Legacy local auth
│   └── ...
├── api/                     # Backend integration
│   ├── supabaseService.ts        # DB operations
│   └── ...
├── lib/                     # Core utilities
│   └── supabase.ts               # Supabase client
├── models/                  # TypeScript types
│   └── cultivatorTypes.ts
└── utils/                   # Helper functions
    ├── leveling.ts               # Level-up calculations
    └── gameLogic.ts              # Game mechanics
```

## Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. **Clone the repository or navigate to the project directory**
   ```bash
   cd "c:\Users\CHRYSG03\OneDrive - Pfizer\Desktop\Personal Files\System Educational App"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit** `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx
│   ├── IdentityCard.tsx
│   └── AddIdentityModal.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── IdentityDetails.tsx
│   └── CharacterProfile.tsx
├── store/              # Zustand state management
│   └── gameStore.ts
├── models/             # TypeScript interfaces
│   └── types.ts
├── utils/              # Utility functions
│   └── gameLogic.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Core Concepts

### Identity
An identity represents a persona or role you want to develop:
- **Name**: "Fitness Enthusiast", "Creative Writer", etc.
- **Description**: What this identity means to you
- **Daily Task**: A specific task to complete daily
- **Level & XP**: Progress tracking through experience points
- **Evolution Stage**: Current mastery level (Novice → Apprentice → Expert → Master → Legend)

### XP & Leveling
- Complete daily tasks to earn **50 base XP**
- **Streak bonuses**: 3+ days = +10 XP, 7+ days = +20 XP, 14+ days = +30 XP, 30+ days = +50 XP
- **Exponential leveling**: Each level requires more XP than the previous
- **Evolution stages** unlock based on level milestones

### Character Profile
Your character represents the combined progress of all active identities:
- **Total Level**: Sum of all active identity levels
- **Total XP**: Combined experience from all identities
- **Evolution Stage**: Based on average level of active identities
- **Achievements**: Unlock rewards for various milestones

## Usage

1. **Create Your First Identity**
   - Click "Add Identity" on the dashboard
   - Fill in the name, description, and daily task
   - Set it as active to start tracking

2. **Complete Daily Tasks**
   - Click the checkmark icon on identity cards
   - Earn XP and maintain streaks
   - Watch your identities level up and evolve

3. **Track Progress**
   - Visit identity detail pages for in-depth stats
   - Check your character profile for overall progress
   - Unlock achievements as you hit milestones

4. **Manage Identities**
   - Pause/activate identities as needed
   - Focus on the identities most important to you
   - Create new identities as you develop new interests

## Customization

The app includes several customization options:

- **Evolution Colors**: Modify colors in `tailwind.config.js`
- **XP Calculations**: Adjust formulas in `src/utils/gameLogic.ts`
- **Achievement System**: Add new achievements in `CharacterProfile.tsx`
- **UI Styling**: Customize appearance using TailwindCSS classes

## Contributing

This is a personal project, but feel free to fork and modify for your own use!

## License

MIT License - feel free to use this project as a foundation for your own gamified habit tracking app.
