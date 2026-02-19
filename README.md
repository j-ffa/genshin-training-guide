# Genshin Training Guide

A webapp that replicates the look and feel of Genshin Impact's in-game Training Guide, without the 2-character limit. Track levelling progress for any number of characters simultaneously.

## Features

- **Character Roster** — browse all ~80 playable characters, mark which ones you own
- **Character Levels** — set current and target levels, see Mora + Hero's Wit + ascension materials needed
- **Weapons** — select a weapon (filtered by character type), view ascension costs + Mystic Enhancement Ores
- **Artifacts** — 5 slots with milestone levels (+0/+4/+8/+12/+16/+20), Mora and XP costs
- **Talents** — 3 talents per character with real in-game names, independent level ranges 1–10
- **Auto-save** — all progress persisted to browser localStorage

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/) (build tool)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [genshin-db](https://github.com/theBowja/genshin-db) (game data)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

Output is placed in the `dist/` directory.
