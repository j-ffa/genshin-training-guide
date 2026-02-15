<script setup>
/**
 * CharacterGrid.vue
 *
 * The left-column scrollable character roster.
 *
 * Two modes controlled by state.ownershipMode:
 *
 * OWNERSHIP MODE ON  → shows ALL characters, dimmed if not owned.
 *                      Clicking toggles ownership.
 *
 * OWNERSHIP MODE OFF → shows ONLY owned characters.
 *                      Clicking selects the character for the detail panel.
 *
 * On first launch (no owned characters yet), the grid automatically enters
 * ownership mode so the user can build their roster straight away.
 */

import { computed, watch } from 'vue'
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import { getAllCharacterNames } from '../data/genshinData.js'
import genshindb from 'genshin-db'
import CharacterCard from './CharacterCard.vue'
import OwnershipToggle from './shared/OwnershipToggle.vue'

const { state, selectCharacter, toggleOwnership } = useTrainingGuide()

// All characters from genshin-db (Traveler excluded)
const allCharacters = getAllCharacterNames()

// Fetch element type for each character for coloured placeholder portraits
// We use a simple cache object rather than calling genshindb per-render
const elementMap = {}
for (const name of allCharacters) {
  const char = genshindb.characters(name)
  if (char) elementMap[name] = char.elementType ?? null
}

// If no characters are owned yet (first launch), auto-enter ownership mode
watch(() => state.ownedCharacters.length, (len) => {
  if (len === 0) state.ownershipMode = true
}, { immediate: true })

/**
 * Characters to display in the grid:
 * - Ownership mode ON  → all characters
 * - Ownership mode OFF → only owned characters
 */
const displayedCharacters = computed(() =>
  state.ownershipMode
    ? allCharacters
    : allCharacters.filter(name => state.ownedCharacters.includes(name))
)

function handleCardClick(name) {
  if (state.ownershipMode) {
    toggleOwnership(name)
  } else {
    selectCharacter(name)
  }
}

/** Get current goal level for a character, or null if no goal exists */
function getLevel(name) {
  return state.characterGoals[name]?.currentLevel ?? null
}
</script>

<template>
  <div class="flex flex-col w-56 shrink-0 bg-genshin-panel border-r border-genshin-border h-full">

    <!-- Header -->
    <div class="px-3 pt-3 pb-2 border-b border-genshin-border shrink-0">
      <h1 class="text-genshin-gold text-sm font-semibold tracking-wide">Training Guide</h1>
      <p class="text-genshin-muted text-[11px] mt-0.5">
        {{ state.ownershipMode ? 'Click characters to add/remove' : `${state.ownedCharacters.length} characters` }}
      </p>
    </div>

    <!-- Character grid — scrollable -->
    <div class="flex-1 overflow-y-auto p-2">
      <p
        v-if="displayedCharacters.length === 0"
        class="text-genshin-muted text-xs text-center mt-4"
      >
        No characters yet.<br>Click "Edit roster" to add some.
      </p>

      <div class="grid grid-cols-3 gap-1">
        <CharacterCard
          v-for="name in displayedCharacters"
          :key="name"
          :name="name"
          :is-owned="state.ownedCharacters.includes(name)"
          :is-selected="state.selectedCharacter === name"
          :level="getLevel(name)"
          :element="elementMap[name]"
          @click="handleCardClick(name)"
        />
      </div>
    </div>

    <!-- Ownership toggle button — pinned to bottom -->
    <div class="p-2 shrink-0 border-t border-genshin-border">
      <OwnershipToggle />
    </div>
  </div>
</template>
