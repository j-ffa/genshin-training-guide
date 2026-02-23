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

import { computed, ref, watch } from 'vue'
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import { getAllCharacterNames, getCharacterIconUrl } from '../data/genshinData.js'
import genshindb from 'genshin-db'
import CharacterCard from './CharacterCard.vue'
import OwnershipToggle from './shared/OwnershipToggle.vue'

const { state, selectCharacter, toggleOwnership, exportData, importData } = useTrainingGuide()

// All characters from genshin-db (Traveler excluded)
const allCharacters = getAllCharacterNames()

// Fetch element type and icon URL for each character (cached, not per-render)
const elementMap = {}
const imageUrlMap = {}
for (const name of allCharacters) {
  const char = genshindb.characters(name)
  if (char) elementMap[name] = char.elementType ?? null
  imageUrlMap[name] = getCharacterIconUrl(name)
}

// Search query for filtering characters in ownership mode
const searchQuery = ref('')

// Clear search when exiting ownership mode
watch(() => state.ownershipMode, (isOn) => {
  if (!isOn) searchQuery.value = ''
})

// If no characters are owned yet (first launch), auto-enter ownership mode
watch(() => state.ownedCharacters.length, (len) => {
  if (len === 0) state.ownershipMode = true
}, { immediate: true })

/**
 * Characters to display in the grid:
 * - Ownership mode ON  → all characters
 * - Ownership mode OFF → only owned characters
 */
const displayedCharacters = computed(() => {
  let chars = state.ownershipMode
    ? allCharacters
    : allCharacters.filter(name => state.ownedCharacters.includes(name))

  // Apply search filter in ownership mode
  if (state.ownershipMode && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    chars = chars.filter(name => name.toLowerCase().includes(query))
  }

  return chars
})

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

/** Trigger a file picker and import the selected JSON file */
function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => importData(reader.result)
    reader.readAsText(file)
  }
  input.click()
}
</script>

<template>
  <div class="flex flex-col bg-genshin-panel border-r border-genshin-border h-full">

    <!-- Header -->
    <div class="px-3 pt-3 pb-2 border-b border-genshin-border shrink-0">
      <h1 class="text-genshin-gold text-base font-semibold tracking-wide">Training Guide</h1>
      <p class="text-genshin-muted text-[11px] mt-0.5">
        {{ state.ownershipMode ? 'Click characters to add/remove' : `${state.ownedCharacters.length} characters` }}
      </p>
    </div>

    <!-- Search bar — visible only in ownership mode -->
    <div v-if="state.ownershipMode" class="px-2 pt-2 shrink-0">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search characters..."
        class="w-full bg-genshin-panel2 border border-genshin-border rounded px-2 py-1.5 text-genshin-text text-xs
               placeholder-genshin-muted focus:outline-none focus:border-genshin-gold"
      />
    </div>

    <!-- Character grid — scrollable -->
    <div class="flex-1 overflow-y-auto p-3">
      <p
        v-if="displayedCharacters.length === 0"
        class="text-genshin-muted text-xs text-center mt-4"
      >
        No characters yet.<br>Click "Edit roster" to add some.
      </p>

      <div class="grid grid-cols-4 gap-2">
        <CharacterCard
          v-for="name in displayedCharacters"
          :key="name"
          :name="name"
          :is-owned="state.ownedCharacters.includes(name)"
          :is-selected="state.selectedCharacter === name"
          :level="getLevel(name)"
          :element="elementMap[name]"
          :image-url="imageUrlMap[name]"
          @click="handleCardClick(name)"
        />
      </div>
    </div>

    <!-- Footer: ownership toggle + export/import — pinned to bottom -->
    <div class="p-2 shrink-0 border-t border-genshin-border space-y-1.5">
      <OwnershipToggle />
      <div class="flex gap-1.5">
        <button
          @click="exportData"
          class="flex-1 px-2 py-1 text-[10px] text-genshin-muted border border-genshin-border rounded
                 hover:text-genshin-text hover:border-genshin-gold/50 transition-colors cursor-pointer"
          title="Download all data as JSON"
        >
          Export
        </button>
        <button
          @click="handleImport"
          class="flex-1 px-2 py-1 text-[10px] text-genshin-muted border border-genshin-border rounded
                 hover:text-genshin-text hover:border-genshin-gold/50 transition-colors cursor-pointer"
          title="Import data from a JSON file"
        >
          Import
        </button>
      </div>
    </div>
  </div>
</template>
