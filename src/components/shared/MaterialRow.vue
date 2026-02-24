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
  <div class="flex items-center gap-3 py-2 px-4 mx-4 my-1 bg-genshin-detail-card/60 border border-genshin-detail-border/50 rounded-lg">
    <!-- Icon: CDN image with fallback to letter placeholder -->
    <div
      class="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
      :class="isMora ? 'bg-genshin-detail-gold/20 text-genshin-detail-gold' : 'bg-genshin-detail-border/50 text-genshin-detail-muted'"
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
    <span class="flex-1 text-sm text-genshin-detail-text min-w-0 truncate">{{ name }}</span>

    <!-- Count (right-aligned) -->
    <span
      class="text-sm font-semibold shrink-0"
      :class="isMora ? 'text-genshin-detail-gold' : 'text-genshin-detail-text'"
    >
      × {{ count.toLocaleString() }}
    </span>
  </div>
</template>
