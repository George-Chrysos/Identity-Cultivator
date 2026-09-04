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

Layout: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`. Spacing tokens in `:root`: `--space-xs: 8px`, `--space-sm: 16px`, `--space-md: 24px`, `--space-lg: 32px`.

- Stat orbs → main task / dailies: `--space-lg`
- Main task → Dailies (stacked mobile): `--space-lg`
- Dailies heading → first row: `--space-sm`
- Between daily rows: `--space-xs`
- Quest/dailies → Financial Pulse: `--space-lg`
- Quick add / Recent → Net Worth: `--space-lg`

Default text is white / near-white. Avoid `text-slate-400` for muted UI — it is overridden to near-white in `index.css`. Use `text-white/40`–`text-white/55` instead.

`ParticleBackground` is an even, low-opacity (4–6%) starfield across the viewport: no link lines, no hover/click scatter. Slow drift + twinkle. `pointer-events-none`.

### Hierarchy (do not re-equalize)

Visual mass, heaviest first. Later UI must not put dailies or momentum back into `card-style` next to the rings.

| Surface | Treatment |
|---|---|
| Stat rings | Heaviest. Floating 5-segment orbs on the wash (no boxes). Whitespace only between them. |
| Main task | Amber/gold quest card (`.quest-card`). Not purple. ~2/3 width on desktop. |
| Dailies | No outer card. Heading + stacked rows on the page wash. ~1/3 width. |
| Momentum | No chrome. Inventory pips under the quest and under the dailies list. |
| Financial pulse | Emerald `.pulse-card` full width under quest/dailies. Not gold. Not purple. |
| Net worth | Slate-blue/silver `.worth-card` (`#94A3B8`) full width after Quick add / Recent. Not emerald. Not pink/violet/cyan. |

Desktop (`lg+`): rings full width → amber quest `lg:col-span-2` + flattened dailies `lg:col-span-1` → Financial Pulse full width → Quick add | Recent → Net Worth. Mobile: rings, quest, dailies, pulse, quick add, recent, net worth.

### Header

Identity cluster on the left: `.rank-badge` (`RANK` Rajdhani + letter Orbitron, `--hud-amber`, letter-spacing, gold text-shadow). Logo is absolutely centered in the header bar. Action on the right only: `.login-btn` ghost outline (gradient on hover). Sign out is a quiet red outline, not a gradient.

History (calendar) sits above the orbs, right-aligned. Scoring help lives only in the Day Editor as a labeled **How to score** control (`!`). Do not add a header `!`.

### Stat rings

Three floating orbs in `MetricStrip` — no rectangular wrappers, no vertical hairlines. History calendar is a right-aligned `.stats-util-btn` above the orbs (36px hit, 18px glyph). Scoring help is labeled **How to score** inside the Day Editor, not on the HUD.

5-segment pip ring (58° arcs, **14° gaps**, 12 o’clock start). Dim tracks and fills use `stroke-linecap: butt`. Icons are Lucide outline at `strokeWidth={1.5}` (HeartPulse / Star / Brain). Fill from the 7-day average:

- faint unbroken `.ring-track` behind everything (~7% opacity)
- full segment: crisp arc + a thinner blurred copy underneath (glow cannot bridge the 14° gap)
- fractional remainder: that segment half-lit via SVG mask (50% cut)
- empty: same hue at 12% opacity, no glow
- **radial ticks**: one short line in the center of each gap (5 total), same hue, 35% opacity, no glow, static

Values use `font-variant-numeric: tabular-nums` and a little extra letter-spacing on decimals.

Number under the ring (`font-data`): large white value + muted `/5` (`.stat-denominator`). Label `font-section` uppercase in the stat color.

Mount: segments and number ease in ~700ms. On **7-day average increase** (metric log only — quest/daily checks do not write scores): segment sweep ~300ms, orb pulse `1 → 1.08 → 1`, number counts up ~400ms, one-shot ripple. `prefers-reduced-motion` skips. Click still opens the metric log modal. Rings never show today's raw score.

### Main task (quest)

Use `.quest-card` (`border-amber-400/50`, gold glow, `--hud-amber`). Heading `font-section` in amber. Input stays `font-body`.

- Empty text: `.quest-empty-pulse` (slow, low-opacity amber border pulse — not alarm red)
- Complete button: default is dark pill, outline circle, label **Check**, gold border on hover. Completed is solid gold fill, dark check, label **Complete**, 200ms fill, burst ripple (`.quest-complete-burst`)
- Complete: `.quest-complete-pulse` on the card, `.quest-check-bounce` on the check, strikethrough via `.quest-strike` / `.quest-strike-on`
- Carryover: quiet slate `RotateCcw`, not a warning color

Quest momentum uses the amber inventory bar.

### Dailies

No outer `card-style`. Whole row is the tap target. Two explicit states (visual only — checking a daily does not write metric scores):

- Unchecked: empty checkbox, **stat-colored habit icon**, full-opacity name, hollow dim outline dot
- Checked: check in the box, same colored icon, name at ~55% opacity, solid glowing dot. Pulse `1 → 1.08 → 1` + row ripple on check.

Color thread at both ends of the row:

- Morning Activation → pink / Vitality
- Ritual → violet / Sovereignty
- Night Protocol → cyan / Clarity

Do not wrap done rows in a second cyan/purple box.

### Momentum blocks

14 cells, oldest left, today right. No numeric streak. Divider after 7 with labels **Last week** | **This week** and **Today →** at the far right (`0.65rem`, opacity 0.4). Extra `--space-md` between daily momentum blocks so week labels do not collide with the next habit name.

- Empty: 8–10% fill of the accent (e.g. `bg-cyan-400/10`). Not a hollow stroke.
- Filled: vertical gradient + soft glow. New fill pops `.slot-pop` (`scale 0.85 → 1`).
- Main-task bar: amber. Daily bars: pink / violet / cyan.
- Label: `text-[10px] uppercase tracking-widest font-section`

### Rank (30-day, weekly freeze)

Client-derived from hydrated entries. Mean of every logged Vitality / Sovereignty / Clarity value in the last 30 days (skip nulls; no quest/daily mixing). None logged → **D**. Persist `{ letter, weekKey }` on the dashboard store; recompute only when the ISO week changes.

| Letter | Mean | Title |
|---|---|---|
| D | `< 2.0` | The Grounded Initiate |
| C | `2.0–2.74` | The Steady Practitioner |
| B | `2.75–3.49` | The Conscious Operator |
| A | `3.50–4.24` | The Sovereign Adept |
| S | `≥ 4.25` | The Lucid Architect |

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

HUD type map (no new font files):

- Rank letter + value → `font-title` / `font-data`; `/5` uses `.stat-denominator`
- HUD labels (Vitality, Dailies, RANK) → `font-section`
- Task input and daily names → `font-body`

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

### Metric symbols (Vitality / Sovereignty / Clarity)

Stored as `body` / `soul` / `mind`. HUD labels and 1–5 anchors:

| Metric | Icon | Text | Chip | Border |
|---|---|---|---|---|
| Vitality | `HeartPulse` | `text-pink-400` | `bg-pink-500/20` | `border-pink-500/50` |
| Sovereignty | `Star` | `text-purple-400` | `bg-purple-500/20` | `border-purple-500/50` |
| Clarity | `Brain` | `text-cyan-400` | `bg-cyan-500/20` | `border-cyan-400/50` |

Scores are **1–5** only (null = not logged). HUD rings show the 7-day average. The Day Editor mini ring shows the **draft 1–5** for that day, not the HUD average.

## Day Editor

One editor (`DayEditor`) for logging from the orbs and for a History day tap. Local draft; Save writes through the store. Today and yesterday can save; older History days are view-only (no Save, task/dailies read-only).

Layout uses `--space-xs/sm/md`:

1. Date label + Today / Yesterday / Past
2. Log mode only: Today | Yesterday segmented control
3. Labeled **How to score** + `!` (opens scoring anchors — not an escape-spiral flag)
4. Three stats: icon + label + live mini 5-segment ring + `ScorePicker` pills
5. Main task: input + Check/Complete when editable; read-only text + completed mark when Past
6. Three dailies, pink / violet / cyan when on (same HUD mapping)
7. Save: 200ms **Saved** + check, then close. Hidden when read-only

Selected score pills use the stat color + glow (`data-stat` pink / violet / cyan). Keyboard `focus-visible` ring on pills.

### History heatmap

Browse-only until a day is tapped; then the same Day Editor slides in below. Month header: prev / **Today** / next. Tapping Today jumps to the current month and opens today. Tapping the selected day again collapses the editor.

| State | Treatment |
|---|---|
| Today | Cyan outline |
| Selected | Neutral white/gray fill (not Sovereignty purple) |
| Has data | Low-opacity fill + small under-dot in the **dominant** logged stat color (highest of Vitality / Sovereignty / Clarity, skip nulls; ties prefer that order). Task/dailies only → muted gray dot |
| No data | Muted number, no fill |
| Future | Dimmed, disabled |

Days before yesterday stay read-only so the archive is not rewritten.

## Glass recipe

Prefer these classes instead of new inline glass:

- **`hud-card`**: HUD surface gradient, `rounded-2xl`, `border-white/10`, inset light-lip, drop shadow. Optional `hud-pulse` / `hud-pulse--cyan`.
- **`card-base`**: `bg-slate-950/60 backdrop-blur-xl rounded-2xl` + light-lip inset.
- **`glow-purple`**: `border-2 border-purple-500/50` + purple outer glow; stronger on hover.
- **`card-style`**: `card-base` + `glow-purple` (default interactive card — not for the HUD quest or dailies).
- **`quest-card`**: amber border + gold glow for the main task only.
- **`pulse-card`**: emerald border + glow (`#34D399`) for Financial Pulse only. Not purple. Not gold.
- **`worth-card`**: slate-blue/silver border + glow (`#94A3B8`) for Net Worth only. Do not mix this silver with Pulse emerald or stat pink/violet/cyan.

Inner highlight (“light lip”): `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.

Header bar: `bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20`.

Inputs: dark translucent field, `rounded-xl`, `border-white/10`, focus ring in the accent color (cyan/violet/pink). Numbers use `font-data`.

## Buttons

- Primary: reserved for rare payoffs (rank-up, milestone). Not Login.
- Login: `.login-btn` ghost outline, gradient wash on hover only.
- Ghost / complete toggle: translucent fill + tinted border (`border-cyan-400/40`, `bg-cyan-500/15` when on).
- Sign out: quiet red outline, transparent fill, `hover:bg-red-500/10`.
- Framer Motion: `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}`.

## Motion and accessibility

Existing keyframes: `glow`, `hudPulse`, `hudPulseCyan`, `questEmptyPulse`, `questCompletePulse`, `questCheckBounce`, `slotPop`, `statOrbPulse`, `statOrbRipple`, `slide-up`, `fade-in`. Respect `prefers-reduced-motion: reduce` (disables aura, hud pulse, quest pulses, ring sweep, orb pulse/ripple, slot pop). Do not add heavy per-frame JS glow.

## Toasts

Glass row, `backdrop-blur-sm`, cyan/violet border for success/info, red/yellow for error/warning. Centered `fixed top-4`.

## History calendar

Glass `BaseModal` (`max-w-2xl`) with the **same dashboard wash** (`#060610` radials) as the page — not a flatter `card-base` slab. Overlay is `bg-black/60` so the page starfield shows through; do not mount a second particle engine. Close hit target is **32×32**. Small viewports can drag the grabber down to dismiss.

Monday-first heatmap. Selected day opens the Day Editor below the grid. Days after today are disabled. Days before yesterday are read-only. Tabs: **Stats** | **Finance** | **Insights**. Finance lists the month's expenses. Insights shows yearly category averages (excluding Business and Utilities) and the net-worth trend for that year.

## Financial pulse

Emerald `.pulse-card`. Amounts are **EUR**. Header: **Week | Month** pill (same segmented control as Day Editor) + chart (Insights) + gear (Settings). Income denominator is always **base salary + extras this calendar month**, even in Week view. Week window is ISO Monday–Sunday.

Smooth continuous ring (not 5-segment): green `<70%`, amber `70–95%`, red `>95%`. No income → empty ring and `—`.

Caps are display-only color states (`<80%` safe, `<100%` warning amber, `>=100%` over red). No banners, no blocking. Over segments get a thin red outline and a one-shot pulse when they first cross.

Settings (gear): **Income** (base monthly + extra-income numpad, green) | **Caps** (seven plain fields). Not part of the daily grid.

Quick add: 7 category glyphs (4+3) → themed numpad → 600ms confirm → back to the grid. Logs **now**.

| Category | Icon | Hex |
|---|---|---|
| Food/Drinks | `Utensils` | `#F59E0B` |
| Business | `Briefcase` | `#6366F1` |
| Utilities | `Lightbulb` | `#FACC15` |
| Groceries | `ShoppingCart` | `#84CC16` |
| Shopping | `ShoppingBag` | `#A78BFA` |
| Social | 🎉 | `#78716C` |
| Other | `Plus` | `#64748B` |

Yearly Insights averages exclude Business and Utilities. Pulse **Avg/day** uses the same filter. Total avg/month and avg savings use that filtered spend. Ring / spent-of-income still counts every category.

## Net worth

Slate-blue/silver `.worth-card` (`#94A3B8`) after Quick add and Recent. Not emerald. Not pink/violet/cyan.

Manual dated snapshots only: `netWorth = savings + sum(assets) − debt`. Debt is one number; assets are itemized and unlimited. Never derive savings from Pulse (income − expenses). **Save Snapshot** always **appends** a new dated row (`todayKey()`); it never overwrites. Latest by `date` then `updatedAt` is the displayed position. Delta vs the previous snapshot: white/silver if up, muted rose only if net dropped.

Composition bars (Savings, Assets sum, Debt) scale to the **largest of the three**. Debt track is muted rose `#F87171` at low opacity so it reads as subtracted.

Edit form: same low-touch Caps style — Savings, one Debt field, asset rows (label + EUR + remove), Add asset.

Insights: SVG area/polyline net-worth trend for the selected year (no chart library). Points are snapshots in that year. Empty: “Save a snapshot on the Net Worth card.” Y-axis from data min/max; month ticks.


