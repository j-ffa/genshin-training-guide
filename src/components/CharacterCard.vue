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

import { ref } from 'vue'
import { ELEMENT_COLOURS } from '../data/genshinData.js'

const props = defineProps({
  name:       { type: String,  required: true },
  isOwned:    { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  level:      { type: Number,  default: null  },  // current goal level, or null
  element:    { type: String,  default: null  },  // e.g. "ELEMENT_PYRO"
  imageUrl:   { type: String,  default: null  },  // CDN icon URL
})

// Falls back to letter placeholder if image fails to load
const imgFailed = ref(false)

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
    <!-- Portrait: CDN image with fallback to coloured letter placeholder -->
    <div
      class="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center text-white text-xl font-bold shrink-0 relative"
      :style="{ backgroundColor: elementColour }"
    >
      <img
        v-if="imageUrl && !imgFailed"
        :src="imageUrl"
        :alt="name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="imgFailed = true"
      />
      <span v-else>{{ name[0] }}</span>

      <!-- Level badge — shown only if a goal has been created for this character -->
      <span
        v-if="level !== null"
        class="absolute bottom-0.5 left-0.5 text-[9px] bg-black/60 text-genshin-gold px-1 rounded leading-tight"
      >
        Lv. {{ level }}
      </span>
    </div>

    <!-- Character name (truncated) -->
    <span class="text-[11px] text-center leading-tight text-genshin-text w-full truncate px-0.5">
      {{ name }}
    </span>
  </div>
</template>
