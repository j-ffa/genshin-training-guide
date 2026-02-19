<script setup>
/**
 * MaterialRow.vue
 *
 * Displays a single material requirement line:
 *   [icon]  Material Name          × 1,234
 *
 * Shows a CDN image if iconUrl is provided, otherwise falls back
 * to a coloured letter placeholder.
 */
import { ref } from 'vue'

const props = defineProps({
  name:    { type: String,  required: true },
  count:   { type: Number,  required: true },
  isMora:  { type: Boolean, default: false },
  iconUrl: { type: String,  default: null },
})

const imgFailed = ref(false)
</script>

<template>
  <div class="flex items-center gap-3 py-2 px-4 border-b border-genshin-border/50 last:border-0">
    <!-- Icon: CDN image with fallback to letter placeholder -->
    <div
      class="w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
      :class="isMora ? 'bg-genshin-gold/20 text-genshin-gold' : 'bg-genshin-border/50 text-genshin-muted'"
    >
      <img
        v-if="iconUrl && !imgFailed"
        :src="iconUrl"
        :alt="name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="imgFailed = true"
      />
      <span v-else>{{ name[0] }}</span>
    </div>

    <!-- Material name -->
    <span class="flex-1 text-sm text-genshin-text min-w-0 truncate">{{ name }}</span>

    <!-- Count (right-aligned) -->
    <span
      class="text-sm font-semibold shrink-0"
      :class="isMora ? 'text-genshin-gold' : 'text-genshin-text'"
    >
      × {{ count.toLocaleString() }}
    </span>
  </div>
</template>
