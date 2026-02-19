/**
 * genshinData.js
 *
 * Thin wrapper around the genshin-db npm package.
 * Handles all data queries and memoises results so the same
 * character/weapon isn't fetched from the package more than once.
 *
 * genshin-db docs: https://github.com/theBowja/genshin-db
 */

import genshindb from 'genshin-db'

// ──────────────────────────────────────────────────────────
// Memo caches — populated on first call, reused thereafter
// ──────────────────────────────────────────────────────────

const _charCache   = {}
const _weaponCache = {}
const _talentCache = {}

// ──────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────

/**
 * Merge one cost item { name, count } into an accumulator array,
 * summing counts for items with the same name.
 */
function mergeCosts(accumulator, items) {
  for (const item of items) {
    const existing = accumulator.find(c => c.name === item.name)
    if (existing) {
      existing.count += item.count
    } else {
      accumulator.push({ name: item.name, count: item.count })
    }
  }
}

/**
 * Maps a character or weapon's current level to the index of the last
 * ascension phase already completed. Phase 1 (ascend1) unlocks cap 40, etc.
 *
 * Used to determine which ascension phases need to be paid for when
 * going from currentLevel to targetLevel.
 */
const LEVEL_TO_PHASE = {
  1:  0,  // no ascension completed yet
  20: 0,
  40: 1,
  50: 2,
  60: 3,
  70: 4,
  80: 5,
  90: 6,
}

// ──────────────────────────────────────────────────────────
// Character queries
// ──────────────────────────────────────────────────────────

/**
 * Returns an array of every playable character name.
 * Traveler (Aether / Lumine) is excluded — their multi-element
 * talent structure doesn't fit the standard 3-talent model.
 */
export function getAllCharacterNames() {
  const allNames = genshindb.characters('names', { matchCategories: true })
  return allNames.filter(name => name !== 'Aether' && name !== 'Lumine')
}

/** Returns the raw genshin-db character object. Cached after first call. */
function getCharacter(charName) {
  if (!_charCache[charName]) {
    _charCache[charName] = genshindb.characters(charName)
  }
  return _charCache[charName]
}

/**
 * Returns the weapon type required by a character.
 * genshin-db uses internal codes like "WEAPON_POLE" — we normalise to
 * a readable string like "Polearm" for display and filtering.
 */
export function getCharacterWeaponType(charName) {
  return getCharacter(charName)?.weaponType ?? null
}

/**
 * Returns a flat array of { name, count } representing all ascension materials
 * needed to go from currentLevel to targetLevel for a character.
 *
 * Example: currentLevel=60, targetLevel=90 → costs for ascend4, ascend5, ascend6
 */
export function getCharacterAscensionCosts(charName, currentLevel, targetLevel) {
  const char = getCharacter(charName)
  if (!char) return []

  const fromPhase = (LEVEL_TO_PHASE[currentLevel] ?? 0) + 1
  const toPhase   =  LEVEL_TO_PHASE[targetLevel]  ?? 0

  if (fromPhase > toPhase) return []

  const costs = []
  for (let phase = fromPhase; phase <= toPhase; phase++) {
    const items = char.costs?.[`ascend${phase}`]
    if (items) mergeCosts(costs, items)
  }
  return costs
}

// ──────────────────────────────────────────────────────────
// Weapon queries
// ──────────────────────────────────────────────────────────

/** Returns an array of every weapon name. */
export function getAllWeaponNames() {
  return genshindb.weapons('names', { matchCategories: true })
}

/** Returns the raw genshin-db weapon object. Cached after first call. */
function getWeapon(weaponName) {
  if (!_weaponCache[weaponName]) {
    _weaponCache[weaponName] = genshindb.weapons(weaponName)
  }
  return _weaponCache[weaponName]
}

/** Returns the internal weapon type string (e.g. "WEAPON_POLE") for a weapon. */
export function getWeaponType(weaponName) {
  return getWeapon(weaponName)?.weaponType ?? null
}

/**
 * Returns weapon ascension costs between two levels.
 * Same phase-mapping logic as character ascension.
 */
export function getWeaponAscensionCosts(weaponName, currentLevel, targetLevel) {
  const weapon = getWeapon(weaponName)
  if (!weapon) return []

  const fromPhase = (LEVEL_TO_PHASE[currentLevel] ?? 0) + 1
  const toPhase   =  LEVEL_TO_PHASE[targetLevel]  ?? 0

  if (fromPhase > toPhase) return []

  const costs = []
  for (let phase = fromPhase; phase <= toPhase; phase++) {
    const items = weapon.costs?.[`ascend${phase}`]
    if (items) mergeCosts(costs, items)
  }
  return costs
}

// ──────────────────────────────────────────────────────────
// Talent queries
// ──────────────────────────────────────────────────────────

/** Returns the raw talent data for a character. Cached after first call. */
function getTalentData(charName) {
  if (!_talentCache[charName]) {
    _talentCache[charName] = genshindb.talents(charName)
  }
  return _talentCache[charName]
}

/**
 * Returns a flat array of { name, count } for upgrading one talent
 * from currentLevel to targetLevel.
 *
 * IMPORTANT: In genshin-db, ALL THREE talents of a character share
 * the same cost table (t.costs.lvl2 through t.costs.lvl10). The same
 * books and boss materials apply regardless of whether you're levelling
 * the normal attack, skill, or burst. Costs are per talent level — call
 * this function separately for each talent with its own level range.
 *
 * Talent levels range from 1 to 10 (base 1, upgrades 2–10).
 */
export function getTalentCosts(charName, currentLevel, targetLevel) {
  const talentData = getTalentData(charName)
  if (!talentData?.costs) return []

  const costs = []
  for (let lvl = currentLevel + 1; lvl <= targetLevel; lvl++) {
    const items = talentData.costs[`lvl${lvl}`]
    if (items) mergeCosts(costs, items)
  }
  return costs
}

// ──────────────────────────────────────────────────────────
// Icon URLs (Enka.Network CDN — reliable for all characters/weapons/materials)
// ──────────────────────────────────────────────────────────

/** Builds a full Enka.Network CDN URL from a genshin-db filename_icon field. */
function enkaUrl(filenameIcon) {
  return filenameIcon ? `https://enka.network/ui/${filenameIcon}.png` : null
}

/** Returns the Enka.Network icon URL for a character, or null if unavailable. */
export function getCharacterIconUrl(charName) {
  return enkaUrl(getCharacter(charName)?.images?.filename_icon)
}

/** Returns the Enka.Network icon URL for a weapon, or null if unavailable. */
export function getWeaponIconUrl(weaponName) {
  return enkaUrl(getWeapon(weaponName)?.images?.filename_icon)
}

// ──────────────────────────────────────────────────────────
// Material queries
// ──────────────────────────────────────────────────────────

const _materialCache = {}

/**
 * Returns the Enka.Network icon URL for a material, or null if unavailable.
 * Queries genshin-db materials with a memo cache.
 */
export function getMaterialIconUrl(materialName) {
  if (_materialCache[materialName] === undefined) {
    const mat = genshindb.materials(materialName)
    _materialCache[materialName] = enkaUrl(mat?.images?.filename_icon)
  }
  return _materialCache[materialName]
}

/**
 * Returns the display names for a character's three combat talents.
 * Falls back to generic labels if data is unavailable.
 */
export function getTalentNames(charName) {
  const talentData = getTalentData(charName)
  return {
    normalAttack: talentData?.combat1?.name ?? 'Normal Attack',
    skill:        talentData?.combat2?.name ?? 'Elemental Skill',
    burst:        talentData?.combat3?.name ?? 'Elemental Burst',
  }
}
