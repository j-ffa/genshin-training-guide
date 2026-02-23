<script setup>
/**
 * DetailHeader.vue
 *
 * Shows the selected character's name and a summary of their goal level
 * at the top of the detail panel.
 */
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import genshindb from 'genshin-db'
import { computed } from 'vue'

const { state, currentGoal } = useTrainingGuide()

// Map element codes to display colours for the element dot
const ELEMENT_COLOURS = {
  ELEMENT_PYRO:    '#e05c4b',
  ELEMENT_HYDRO:   '#2e96c7',
  ELEMENT_ANEMO:   '#4ec0a1',
  ELEMENT_ELECTRO: '#9a5ec7',
  ELEMENT_DENDRO:  '#6eb04e',
  ELEMENT_CRYO:    '#7ec7d4',
  ELEMENT_GEO:     '#c89b3c',
}

const characterData = computed(() =>
  state.selectedCharacter ? genshindb.characters(state.selectedCharacter) : null
)

const elementColour = computed(() => {
  const el = characterData.value?.elementType
  return el ? (ELEMENT_COLOURS[el] ?? '#5a6478') : '#5a6478'
})
</script>

<template>
  <div class="flex items-center gap-3 px-6 py-5 border-b border-genshin-detail-border shrink-0">
    <!-- Element colour dot -->
    <div
      class="w-3 h-3 rounded-full shrink-0"
      :style="{ backgroundColor: elementColour }"
    />

    <!-- Character name -->
    <div class="flex-1 min-w-0">
      <h2 class="text-genshin-detail-text text-lg font-semibold leading-tight truncate">
        {{ state.selectedCharacter }}
      </h2>
      <p v-if="currentGoal" class="text-genshin-detail-muted text-xs mt-0.5">
        Lv. {{ currentGoal.currentLevel }} → {{ currentGoal.targetLevel }}
      </p>
    </div>
  </div>
</template>
