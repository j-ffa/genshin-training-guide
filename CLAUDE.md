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

## Current State (as of 2026-02-23)

The core app is fully built and working. All five build phases plus a quick-wins sprint are complete, plus artifact substats, completion indicators, and export/import.

### What's done
- Dark Genshin-themed two-column layout (left: character grid, right: detail panel)
- Character roster with **ownership toggle mode** — all ~80 characters available (Traveler excluded by design), user marks owned characters, non-owned are hidden when toggle is off
- **Character search** in ownership mode — search bar filters the grid by name
- Per-character goal settings persisted to `localStorage`, lazily created on first selection
- **Character Level tab** — preset dropdown selectors with ascension phase labels (A1–A6), shows combined Mora + Hero's Wits + all ascension materials
- **Weapon tab** — weapon selector filtered to character's weapon type, weapon icon displayed when selected, ascension costs + Mystic Enhancement Ores
- **Artifacts tab** — 5 collapsible slots with milestone level dropdowns (+0/+4/+8/+12/+16/+20), Mora + EXP cost per slot + totals. Each slot has **main stat selector** (locked for Flower=HP, Plume=ATK) and **desired substats** with configurable farming strictness (how many of the selected substats the user wants)
- **Talents tab** — 3 collapsible talent sections with real in-game talent names, independent level ranges 1–10, materials per talent, allows current=target
- **Green completion indicators** — green dots on tab bar when all goals in a tab are at target, plus individual green dots on talent section headers
- **JSON export/import buttons** in the character grid footer — export downloads a JSON backup, import opens a file picker
- **Character portrait images** from Enka.Network CDN with element-coloured letter fallback
- **Material icons** from Enka.Network CDN with letter fallback
- All state auto-saved to `localStorage` on every change (loaded at module init to avoid race conditions)

### What's NOT done yet
- Cross-character total material summary (aggregate Mora + shared materials across all tracked characters)
- Material inventory tracking (what the user currently owns) — intentionally deferred
- Full UI refresh to more closely match in-game Training Guide proportions and colour scheme

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
    ├── DetailPanel.vue                # Right column: placeholder or header+tabs+content
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
- **Level tables**: Hardcoded cumulative EXP values in `levelTables.js` for character levels (1→20→40→50→60→70→80→90), weapon levels, and artifact levels. Mora from levelling = EXP × 0.2 for characters, EXP × 0.005 for weapons.
- **Level selectors**: All use `<select>` dropdowns (not free-text inputs) constrained to valid game milestones. `LevelRangeInput` accepts `currentOptions`, `targetOptions`, optional `currentLabels` for ascension phases, and `allowEqual` for talent sections.
- **Traveler excluded**: Aether and Lumine are filtered out in `getAllCharacterNames()` — their multi-element talent structure doesn't fit the standard 3-talent model.
- **localStorage key**: `'genshin-training-guide-v1'` — bump to v2 if the state schema changes.
- **genshin-db limitations**: v5.2.8 doesn't include weapons/characters from game version 5.3+. Missing items get letter-placeholder fallbacks.

## Data & Persistence

- All data stored in `localStorage` under key `genshin-training-guide-v1`
- JSON export/import functions exist in `useTrainingGuide.js` (`exportData()`, `importData()`) but no UI button yet
- Future: potential OCR integration (e.g. Inventory Kamera JSON format) to auto-populate material counts

## Developer Notes

- User is a returning web dev (background in HTML/CSS/JS, Bootstrap), now using Vue for the first time
- Keep code approachable and well-commented where logic isn't obvious
- Prefer simplicity over over-engineering
- Tailwind v4: custom colours are in `@theme {}` in `style.css` — do NOT create `tailwind.config.js`
- genshin-db: query characters with `genshindb.characters('names', { matchCategories: true })` for the full list
