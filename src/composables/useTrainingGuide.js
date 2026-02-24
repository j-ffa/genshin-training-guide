/**
 * useTrainingGuide.js
 *
 * The single source of truth for all app state.
 * All components import this composable to read state and call actions.
 *
 * State is stored at module level (outside the exported function) so that
 * every component that calls useTrainingGuide() shares the same reactive
 * object — this is Vue's way of doing global state without Pinia.
 */

import { reactive, computed, watch } from 'vue'
import { getAllCharacterNames } from '../data/genshinData.js'

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'genshin-training-guide-v1'

// Valid level caps that align with ascension phase milestones
export const VALID_CHARACTER_LEVELS = [20, 40, 50, 60, 70, 80, 90]
export const VALID_WEAPON_LEVELS    = [20, 40, 50, 60, 70, 80, 90]

// ──────────────────────────────────────────────────────────
// Module-level reactive state
// ──────────────────────────────────────────────────────────

const state = reactive({
  /** Array of character names the user has marked as owned */
  ownedCharacters: [],

  /**
   * Goals keyed by character name.
   * Each entry is created lazily when a character is first selected.
   * Shape: see createDefaultGoal() below.
   */
  characterGoals: {},

  /** The currently selected character name (string | null) */
  selectedCharacter: null,

  /**
   * When true, clicking a CharacterCard toggles ownership
   * instead of selecting the character for the detail panel.
   */
  ownershipMode: false,
})

// ──────────────────────────────────────────────────────────
// Default goal factory
// ──────────────────────────────────────────────────────────

/**
 * Returns a fresh goal object with sensible defaults.
 * Called by ensureGoal() the first time a character is selected.
 */
function createDefaultGoal() {
  return {
    currentLevel: 1,
    targetLevel:  90,

    weapon:             null,  // weapon name string, or null if not yet set
    weaponCurrentLevel: 1,
    weaponTargetLevel:  90,

    artifacts: [
      { slot: 'Flower',  currentLevel: 0, targetLevel: 20, mainStat: 'HP',  desiredSubstats: [], targetSubstatCount: 0 },
      { slot: 'Plume',   currentLevel: 0, targetLevel: 20, mainStat: 'ATK', desiredSubstats: [], targetSubstatCount: 0 },
      { slot: 'Sands',   currentLevel: 0, targetLevel: 20, mainStat: null,  desiredSubstats: [], targetSubstatCount: 0 },
      { slot: 'Goblet',  currentLevel: 0, targetLevel: 20, mainStat: null,  desiredSubstats: [], targetSubstatCount: 0 },
      { slot: 'Circlet', currentLevel: 0, targetLevel: 20, mainStat: null,  desiredSubstats: [], targetSubstatCount: 0 },
    ],

    talents: {
      normalAttack: { currentLevel: 1, targetLevel: 9 },
      skill:        { currentLevel: 1, targetLevel: 9 },
      burst:        { currentLevel: 1, targetLevel: 9 },
    },
  }
}

// ──────────────────────────────────────────────────────────
// Persistence
// ──────────────────────────────────────────────────────────

/**
 * Load saved state from localStorage on app startup.
 * Call this once from App.vue's onMounted().
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // Merge saved fields into state (Object.assign so reactivity is preserved)
      if (Array.isArray(saved.ownedCharacters)) state.ownedCharacters = saved.ownedCharacters
      if (saved.characterGoals)                 state.characterGoals  = saved.characterGoals
      if (saved.selectedCharacter)              state.selectedCharacter = saved.selectedCharacter
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
}

// Load saved state immediately at module init (before any watchers in
// components can mutate state and trigger the auto-save watcher below).
// localStorage is synchronous so this is safe to do at import time.
loadFromStorage()

// Auto-save whenever state changes.
// { deep: true } watches nested objects (goals, artifacts, talents, etc.)
watch(state, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, { deep: true })

// ──────────────────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────────────────

/**
 * Create a default goal for charName if one doesn't exist yet.
 * Safe to call multiple times — does nothing if goal already exists.
 */
function ensureGoal(charName) {
  if (!state.characterGoals[charName]) {
    state.characterGoals[charName] = createDefaultGoal()
  }
}

/**
 * Set the selected character and ensure their goal record exists.
 * Only has effect when NOT in ownership mode.
 */
function selectCharacter(name) {
  if (state.ownershipMode) return
  ensureGoal(name)
  state.selectedCharacter = name
}

/**
 * Toggle whether a character is in the user's owned roster.
 * In ownership mode: called when clicking a CharacterCard.
 */
function toggleOwnership(name) {
  const idx = state.ownedCharacters.indexOf(name)
  if (idx === -1) {
    state.ownedCharacters.push(name)
  } else {
    state.ownedCharacters.splice(idx, 1)
  }
}

/**
 * Partially update the goal for charName.
 * patch is an object whose keys are merged into the goal.
 *
 * For nested updates (e.g. talents), use deep keys:
 *   updateGoal('Xiangling', { 'talents.normalAttack.targetLevel': 9 })
 * Or pass a callback for complex mutations:
 *   updateGoal('Xiangling', goal => { goal.talents.skill.targetLevel = 8 })
 */
function updateGoal(charName, patchOrFn) {
  ensureGoal(charName)
  const goal = state.characterGoals[charName]

  if (typeof patchOrFn === 'function') {
    patchOrFn(goal)
  } else {
    Object.assign(goal, patchOrFn)
  }
}

// ──────────────────────────────────────────────────────────
// Import validation
// ──────────────────────────────────────────────────────────

const VALID_CHAR_NAMES = new Set(getAllCharacterNames())
const VALID_SLOTS = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet']
const VALID_TALENT_KEYS = ['normalAttack', 'skill', 'burst']

/**
 * Validates parsed import data and returns an array of error strings.
 * Empty array = valid data.
 */
function validateImportData(data) {
  const errors = []

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['Import data must be a JSON object']
  }

  // ownedCharacters
  if (data.ownedCharacters !== undefined) {
    if (!Array.isArray(data.ownedCharacters)) {
      errors.push('ownedCharacters must be an array')
    } else {
      for (const name of data.ownedCharacters) {
        if (typeof name !== 'string') {
          errors.push(`ownedCharacters contains non-string value: ${JSON.stringify(name)}`)
        } else if (!VALID_CHAR_NAMES.has(name)) {
          errors.push(`Unknown character in ownedCharacters: "${name}"`)
        }
      }
    }
  }

  // selectedCharacter
  if (data.selectedCharacter !== undefined && data.selectedCharacter !== null) {
    if (typeof data.selectedCharacter !== 'string' || !VALID_CHAR_NAMES.has(data.selectedCharacter)) {
      errors.push(`Invalid selectedCharacter: "${data.selectedCharacter}"`)
    }
  }

  // characterGoals
  if (data.characterGoals !== undefined) {
    if (typeof data.characterGoals !== 'object' || data.characterGoals === null || Array.isArray(data.characterGoals)) {
      errors.push('characterGoals must be an object')
    } else {
      for (const [charName, goal] of Object.entries(data.characterGoals)) {
        if (!VALID_CHAR_NAMES.has(charName)) {
          errors.push(`Unknown character in goals: "${charName}"`)
          continue
        }
        if (typeof goal !== 'object' || goal === null) {
          errors.push(`Goal for "${charName}" is not an object`)
          continue
        }

        // Check level values
        if (!VALID_CHARACTER_LEVELS.includes(goal.currentLevel) && goal.currentLevel !== 1) {
          errors.push(`"${charName}" has invalid currentLevel: ${goal.currentLevel}`)
        }
        if (!VALID_CHARACTER_LEVELS.includes(goal.targetLevel) && goal.targetLevel !== 1) {
          errors.push(`"${charName}" has invalid targetLevel: ${goal.targetLevel}`)
        }

        // Artifacts
        if (goal.artifacts !== undefined) {
          if (!Array.isArray(goal.artifacts) || goal.artifacts.length !== 5) {
            errors.push(`"${charName}" artifacts must be an array of 5`)
          } else {
            for (let i = 0; i < 5; i++) {
              const a = goal.artifacts[i]
              if (!a || a.slot !== VALID_SLOTS[i]) {
                errors.push(`"${charName}" artifact[${i}] has wrong slot (expected "${VALID_SLOTS[i]}")`)
              }
            }
          }
        }

        // Talents
        if (goal.talents !== undefined) {
          if (typeof goal.talents !== 'object' || goal.talents === null) {
            errors.push(`"${charName}" talents must be an object`)
          } else {
            for (const key of VALID_TALENT_KEYS) {
              const t = goal.talents[key]
              if (t && (t.currentLevel < 1 || t.currentLevel > 10 || t.targetLevel < 1 || t.targetLevel > 10)) {
                errors.push(`"${charName}" talent "${key}" has out-of-range levels`)
              }
            }
          }
        }
      }
    }
  }

  return errors
}

// ──────────────────────────────────────────────────────────
// Export / Import
// ──────────────────────────────────────────────────────────

function exportData() {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'genshin-training-guide.json'
  a.click()
  URL.revokeObjectURL(url)
}

function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)

    // Validate before applying
    const errors = validateImportData(parsed)
    if (errors.length > 0) {
      const shown = errors.slice(0, 5).join('\n• ')
      const suffix = errors.length > 5 ? `\n…and ${errors.length - 5} more` : ''
      alert(`Import rejected — data has errors:\n\n• ${shown}${suffix}`)
      return
    }

    if (Array.isArray(parsed.ownedCharacters)) state.ownedCharacters = parsed.ownedCharacters
    if (parsed.characterGoals)                 state.characterGoals  = parsed.characterGoals
    if (parsed.selectedCharacter !== undefined) state.selectedCharacter = parsed.selectedCharacter
  } catch (e) {
    console.error('Failed to import data:', e)
    alert('Import failed — the file does not appear to be valid JSON.')
  }
}

// ──────────────────────────────────────────────────────────
// Computed helpers
// ──────────────────────────────────────────────────────────

/** Shortcut to the currently selected character's goal object, or null */
const currentGoal = computed(() =>
  state.selectedCharacter ? state.characterGoals[state.selectedCharacter] : null
)

// ──────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────

export function useTrainingGuide() {
  return {
    state,
    currentGoal,
    loadFromStorage,
    selectCharacter,
    toggleOwnership,
    ensureGoal,
    updateGoal,
    exportData,
    importData,
  }
}
