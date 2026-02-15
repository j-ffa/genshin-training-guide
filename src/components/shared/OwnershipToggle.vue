<script setup>
/**
 * OwnershipToggle.vue
 *
 * A small button that activates/deactivates ownership edit mode.
 *
 * When ownership mode is ON:
 *   - The character grid shows ALL characters (unowned are dimmed)
 *   - Clicking a card toggles its owned status
 *
 * When ownership mode is OFF:
 *   - The grid shows only owned characters
 *   - Clicking a card selects it for the detail panel
 */
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'

const { state } = useTrainingGuide()

function toggle() {
  state.ownershipMode = !state.ownershipMode
}
</script>

<template>
  <button
    @click="toggle"
    class="w-full py-2 px-3 text-xs rounded border transition-colors duration-150 cursor-pointer"
    :class="state.ownershipMode
      ? 'bg-genshin-gold text-genshin-bg border-genshin-gold font-semibold'
      : 'bg-transparent text-genshin-muted border-genshin-border hover:border-genshin-gold hover:text-genshin-gold'"
  >
    {{ state.ownershipMode ? 'Done editing roster' : 'Edit roster' }}
  </button>
</template>
