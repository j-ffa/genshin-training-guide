# Genshin Training Guide

A webapp that replicates the look and feel of Genshin Impact's in-game Training Guide feature, but without the 2-character limit.

## Project Goal

Allow players to track levelling progress for any number of characters simultaneously. Each character entry tracks:
- Character level (target)
- Weapon level (target)
- Artifacts (5 slots, level 0–20)
- Character talents (Normal Attack / Skill / Burst, levels 1–10)

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** (build tool)
- **Tailwind CSS v4** (styling — uses `@theme {}` in `style.css`, NO `tailwind.config.js`)
- **genshin-db** v5.2.8 (npm package by theBowja — provides character/weapon/talent game data)
- No backend — persistence via browser `localStorage`

## Current State (as of 2026-02-24)

The core app is fully built and working. All five build phases plus a quick-wins sprint are complete, plus artifact substats, completion indicators, export/import, a full UI refresh, and a bug-fix/feature sprint tackling issues #13–#16 and #21.

### What's done
- **Warm brown/parchment two-column layout** matching in-game Training Guide aesthetic — dark warm-brown left panel with proportional width (38%, 320–520px), parchment-coloured (`#ece5d8`) right detail panel
- **4-column character grid** with larger 80px portraits, rounded-lg corners, and "Lv. XX" badges at bottom-left
- Character roster with **ownership toggle mode** — all ~80 characters available (Traveler excluded by design), user marks owned characters, non-owned are hidden when toggle is off
- **Character search** in ownership mode — search bar filters the grid by name
- Per-character goal settings persisted to `localStorage`, lazily created on first selection
- **Character Level tab** — preset dropdown selectors with ascension phase labels (A1–A6), shows combined Mora + Hero's Wits + all ascension materials
- **Weapon tab** — weapon selector filtered to character's weapon type, weapon icon displayed when selected, ascension costs + Mystic Enhancement Ores
- **Artifacts tab** — 5 collapsible slots with milestone level dropdowns (+0/+4/+8/+12/+16/+20), Mora + EXP cost per slot + totals. Each slot has **main stat selector** (locked for Flower=HP, Plume=ATK) and **desired substats** with configurable farming strictness (how many of the selected substats the user wants)
- **Talents tab** — 3 collapsible talent sections with real in-game talent names, independent level ranges 1–10, materials per talent, allows current=target
- **Pill-shaped tab bar** — rounded-full tabs with dark active / light inactive styling, always-visible red/green completion dots
- **Card-style material rows** — larger 44px icons, rounded-lg cards with subtle borders on parchment background
- **Light-bg form controls** — all dropdowns/selects use `bg-white/60` with `border-genshin-detail-border` in the detail panel
- **JSON export/import buttons** in the character grid footer — export downloads a JSON backup, import opens a file picker
- **Character portrait images** from Enka.Network CDN with element-coloured letter fallback
- **Material icons** from Enka.Network CDN with letter fallback
- All state auto-saved to `localStorage` on every change (loaded at module init to avoid race conditions)
- **Cross-character material summary** — when no character is selected, the detail panel shows aggregated material costs across all tracked characters (Mora, books, ascension mats, etc.)
- **Import validation** — `importData()` validates structure (character names, level ranges, artifact slots, talent keys) before applying, rejects malformed data with error alerts
- **Accessible gold text** — `--color-genshin-detail-gold` (#a68a2a) token for ~5:1 contrast on parchment; original `genshin-gold` kept for dark backgrounds
- **Element colour map** shared from `genshinData.js` (no longer duplicated in CharacterCard/DetailHeader)

### What's NOT done yet
- Material inventory tracking (what the user currently owns) — intentionally deferred

## Project Structure

```
src/
├── main.js
├── style.css                          # Tailwind import + @theme colour tokens
├── App.vue                            # Root: two-column layout
├── composables/
│   └── useTrainingGuide.js            # ALL reactive state + localStorage sync + export/import
├── data/
│   ├── genshinData.js                 # genshin-db wrapper (memoised queries) + Enka CDN icon URLs
│   └── levelTables.js                 # Hardcoded XP/Mora cost tables (character, weapon, artifact)
└── components/
    ├── CharacterCard.vue              # Single portrait tile (CDN image + name + level badge)
    ├── CharacterGrid.vue              # Left column: scrollable grid, ownership mode, search
    ├── DetailHeader.vue               # Character name + element colour dot
    ├── DetailPanel.vue                # Right column: summary (no selection) or header+tabs+content
    ├── MaterialSummary.vue            # Aggregated material costs across all characters
    ├── TabBar.vue                     # Four-tab navigation (v-model)
    ├── shared/
    │   ├── MaterialRow.vue            # Single material cost row (CDN icon + name + count)
    │   ├── LevelRangeInput.vue        # Reusable current→target dropdown selector
    │   └── OwnershipToggle.vue        # Edit roster / Done editing button
    └── tabs/
        ├── CharacterLevelTab.vue
        ├── WeaponTab.vue
        ├── ArtifactsTab.vue
        └── TalentsTab.vue
```

## Key Architecture Decisions

- **State**: Single `reactive({})` object at module level in `useTrainingGuide.js` — all components share the same instance (Vue's global state pattern without Pinia). `watch(state, ..., { deep: true })` handles all localStorage persistence. State is loaded synchronously at module init (not in `onMounted`) to prevent race conditions with immediate watchers.
- **genshin-db queries**: All wrapped in `src/data/genshinData.js` with memo caches. Talent costs are at `t.costs.lvl2–lvl10` (shared for all three talents of a character — same books/boss drops regardless of which talent).
- **Icon CDN**: All game asset icons (characters, weapons, materials) served from Enka.Network (`https://enka.network/ui/{filename_icon}.png`). The MiHoYo CDN URLs in genshin-db are stale for newer content. All icons have `@error` fallbacks to letter placeholders.
- **Dual colour tokens**: The left panel uses dark tokens (`genshin-panel`, `genshin-text`, `genshin-muted`, `genshin-border`, `genshin-gold`). The right detail panel uses light/parchment tokens (`genshin-detail-bg`, `genshin-detail-text`, `genshin-detail-muted`, `genshin-detail-border`, `genshin-detail-card`, `genshin-detail-gold`). Components inside the detail panel must use `detail-*` variants — especially `detail-gold` instead of `genshin-gold` for WCAG AA contrast.
- **Level tables**: Hardcoded cumulative EXP values in `levelTables.js` for character levels (1→20→40→50→60→70→80→90), weapon levels, and artifact levels. Mora from levelling = EXP × 0.2 for characters, EXP × 0.005 for weapons.
- **Level selectors**: All use `<select>` dropdowns (not free-text inputs) constrained to valid game milestones. `LevelRangeInput` accepts `currentOptions`, `targetOptions`, optional `currentLabels` for ascension phases, and `allowEqual` for talent sections.
- **Traveler excluded**: Aether and Lumine are filtered out in `getAllCharacterNames()` — their multi-element talent structure doesn't fit the standard 3-talent model.
- **localStorage key**: `'genshin-training-guide-v1'` — bump to v2 if the state schema changes.
- **genshin-db limitations**: v5.2.8 doesn't include weapons/characters from game version 5.3+. Missing items get letter-placeholder fallbacks.

## Data & Persistence

- All data stored in `localStorage` under key `genshin-training-guide-v1`
- JSON export/import functions exist in `useTrainingGuide.js` (`exportData()`, `importData()`) with UI buttons in the grid footer
- Future: potential OCR integration (e.g. Inventory Kamera JSON format) to auto-populate material counts

## Developer Notes

- User is a returning web dev (background in HTML/CSS/JS, Bootstrap), now using Vue for the first time
- Keep code approachable and well-commented where logic isn't obvious
- Prefer simplicity over over-engineering
- Tailwind v4: custom colours are in `@theme {}` in `style.css` — do NOT create `tailwind.config.js`
- genshin-db: query characters with `genshindb.characters('names', { matchCategories: true })` for the full list

# Dev Server

http://127.0.0.1:5173/
- Can use Playwright MCP to view site and monitor progress if it would be beneficial

