# Visual system

Use this file as the source of truth when adding UI. Compose from existing Tailwind tokens and CSS classes. Do not invent new palettes.

## Page shell

Two backgrounds stack:

1. Body (in `src/index.css`): purple depth gradient  
   `linear-gradient(rgb(15, 7, 40) 0%, rgb(26, 11, 63) 30%, rgb(30, 10, 82) 60%, rgb(42, 19, 96) 100%)`
2. Dashboard wash (Tailwind on the page root):

```
bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)]
```

Always keep `ParticleBackground` behind content (`absolute inset-0 z-0`). Content sits at `relative z-10`. Header is `fixed` with `z-50`.

Layout: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`, vertical stack with `space-y-4`. Default text is white / near-white.

## Fonts

Loaded in `index.html`. Tailwind families in `tailwind.config.js`.

| Role | Family | Classes |
|---|---|---|
| Titles, headings | Orbitron | `font-title`, all `h1`–`h6` |
| Body / UI | Exo 2 | `font-body`, default `body` |
| Numbers / data | Share Tech Mono | `font-data` |
| Rare ritual copy | Cinzel Decorative | `font-accent` |
| Section labels | Rajdhani | `font-section` |
| Dates / technical | JetBrains Mono | `font-mono` |

Headings: weight 700–800, `letter-spacing: 0.02em`. Section chips: uppercase, wide tracking (`tracking-widest`).

## Palette

### HUD CSS variables (`:root` in `src/index.css`)

| Token | Value |
|---|---|
| `--hud-surface-1` | `#090918` |
| `--hud-surface-2` | `#0d0d22` |
| `--hud-cyan` | `#00f5d4` |
| `--hud-pink` | `#f72585` |
| `--hud-amber` | `#f9c74f` |
| `--hud-purple` | `#a855f7` |

### Core accents

- Violet: `#a855f7` / `#7c3aed`
- Cyan: `#22d3ee` / `#06b6d4` / `#00f5d4`
- Pink / warrior: `#ec4899` / `#f72585`
- Amber: `#f9c74f` / `#f59e0b`
- Surfaces: `#0B0B1A`, `#1A1A2E`, `#16213E`
- Borders: `white/10`, `purple-500/50`, `#2A2F5F`

### Metric symbols (Body / Mind / Soul)

From `STAT_COLORS` in `src/constants/theme.ts`:

| Metric | Icon | Text | Chip | Border | Glow |
|---|---|---|---|---|---|
| Body | `HeartPulse` | `text-pink-400` | `bg-pink-500/20` | `border-pink-500/50` | `rgba(236, 72, 153, 0.6)` |
| Mind | `Brain` | `text-cyan-400` | `bg-cyan-500/20` | `border-cyan-500/50` | `rgba(6, 182, 212, 0.5)` |
| Soul | `Sparkles` | `text-purple-400` | `bg-purple-500/20` | `border-purple-500/50` | `rgba(168, 85, 247, 0.6)` |

Visible label is the symbol. Put the word in `aria-label` and a tiny uppercase caption if needed.

## Glass recipe

Prefer these classes instead of new inline glass:

- **`hud-card`**: HUD surface gradient, `rounded-2xl`, `border-white/10`, inset light-lip, drop shadow. Optional `hud-pulse` / `hud-pulse--cyan`.
- **`card-base`**: `bg-slate-950/60 backdrop-blur-xl rounded-2xl` + light-lip inset.
- **`glow-purple`**: `border-2 border-purple-500/50` + purple outer glow; stronger on hover.
- **`card-style`**: `card-base` + `glow-purple` (default interactive card).

Inner highlight (“light lip”): `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.

Header bar: `bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20`.

Inputs: dark translucent field, `rounded-xl`, `border-white/10`, focus ring in the accent color (cyan/violet/pink). Numbers use `font-data`.

## Buttons

- Primary: `bg-gradient-to-r from-violet-600 to-cyan-600`, white text, `rounded-lg` / `rounded-xl`, `shadow-lg`. Hover darkens both stops.
- Ghost / complete toggle: translucent fill + tinted border (`border-cyan-400/40`, `bg-cyan-500/15` when on).
- Sign out: `bg-red-500/15 border-red-400/40 text-red-200`.
- Framer Motion: `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}`.

## Motion and accessibility

Existing keyframes: `glow`, `hudPulse`, `hudPulseCyan`, `slide-up`, `fade-in`. Respect `prefers-reduced-motion: reduce` (already disables aura/hud pulse in CSS). Do not add heavy per-frame JS glow.

## Toasts

Glass row, `backdrop-blur-sm`, cyan/violet border for success/info, red/yellow for error/warning. Centered `fixed top-4`.
