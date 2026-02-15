# Genshin Training Guide

A webapp that replicates the look and feel of Genshin Impact's in-game Training Guide feature, but without the 2-character limit.

## Project Goal

Allow players to track levelling progress for any number of characters simultaneously. Each character entry tracks:
- Character level (target)
- Weapon level (target)
- Artifacts
- Character talents

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- No backend — persistence via browser `localStorage`

## Data & Persistence

- All data stored in `localStorage`
- JSON export/import supported so users can back up and share their data
- Future: potential OCR integration (e.g. Inventory Kamera JSON format) to auto-populate material counts

## UI Style

- Dark-themed, inspired by Genshin Impact's in-game Training Guide UI
- Genshin aesthetic: parchment/fantasy colours, gold accents

## Data Entry

- Manual +/- buttons with a text input for setting quantities (e.g. mora, local specialties, enhancement materials)
- No live game integration — user updates values manually or via JSON import

## Project Structure

- `src/components/` — Vue components
- `src/assets/` — images, icons
- `src/style.css` — global styles (includes Tailwind import)

## Developer Notes

- User is a returning web dev (background in HTML/CSS/JS, Bootstrap), now using Vue for the first time
- Keep code approachable and well-commented where logic isn't obvious
- Prefer simplicity over over-engineering
