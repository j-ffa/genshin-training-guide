<script setup>
/**
 * MaterialRow.vue
 *
 * Displays a single material requirement line:
 *   [icon placeholder]  Material Name          × 1,234
 *
 * Used in all four tab components.
 */
defineProps({
  name:    { type: String,  required: true },
  count:   { type: Number,  required: true },
  // Optional: pass 'mora' to style Mora differently (gold colour)
  isMora:  { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-center gap-3 py-2 px-4 border-b border-genshin-border/50 last:border-0">
    <!-- Icon placeholder: coloured square (will be replaced with real images later) -->
    <div
      class="w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold"
      :class="isMora ? 'bg-genshin-gold/20 text-genshin-gold' : 'bg-genshin-border/50 text-genshin-muted'"
    >
      {{ name[0] }}
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
