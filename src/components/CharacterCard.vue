<script setup>
/**
 * CharacterCard.vue
 *
 * A single character tile in the left-column grid.
 * Shows a coloured placeholder portrait (with the character's element colour),
 * the character name, and their current goal level if one has been set.
 *
 * Visual states:
 * - Not owned + ownership mode off  → hidden (parent filters these out)
 * - Not owned + ownership mode on   → dim/greyed out
 * - Owned, not selected             → normal
 * - Selected                        → gold border highlight
 */

const props = defineProps({
  name:       { type: String,  required: true },
  isOwned:    { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  level:      { type: Number,  default: null  },  // current goal level, or null
  element:    { type: String,  default: null  },  // e.g. "ELEMENT_PYRO"
})

// Map genshin-db's internal element codes to Tailwind bg colours.
// Using inline style for the exact game colours rather than theme tokens,
// since elements have very specific brand colours.
const ELEMENT_COLOURS = {
  ELEMENT_PYRO:    '#e05c4b',
  ELEMENT_HYDRO:   '#2e96c7',
  ELEMENT_ANEMO:   '#4ec0a1',
  ELEMENT_ELECTRO: '#9a5ec7',
  ELEMENT_DENDRO:  '#6eb04e',
  ELEMENT_CRYO:    '#7ec7d4',
  ELEMENT_GEO:     '#c89b3c',
}

const elementColour = props.element ? (ELEMENT_COLOURS[props.element] ?? '#5a6478') : '#5a6478'
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-1 p-1 rounded cursor-pointer select-none transition-all duration-150"
    :class="{
      'opacity-35': !isOwned,
      'ring-2 ring-genshin-gold ring-offset-1 ring-offset-genshin-bg': isSelected,
      'hover:brightness-110': isOwned,
    }"
  >
    <!-- Portrait placeholder: coloured square with character initial -->
    <div
      class="w-14 h-14 rounded flex items-center justify-center text-white text-xl font-bold shrink-0"
      :style="{ backgroundColor: elementColour }"
    >
      {{ name[0] }}
    </div>

    <!-- Character name (truncated) -->
    <span class="text-[10px] text-center leading-tight text-genshin-text w-full truncate px-0.5">
      {{ name }}
    </span>

    <!-- Level badge — shown only if a goal has been created for this character -->
    <span
      v-if="level !== null"
      class="absolute top-0.5 right-0.5 text-[9px] bg-black/60 text-genshin-gold px-1 rounded leading-tight"
    >
      {{ level }}
    </span>
  </div>
</template>
