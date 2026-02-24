<script setup>
/**
 * MaterialSummary.vue
 *
 * Aggregated material costs across all tracked characters.
 * Shown in the detail panel when no character is selected.
 */
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import MaterialRow from './shared/MaterialRow.vue'

const { totalMaterials } = useTrainingGuide()
</script>

<template>
  <div class="flex flex-col h-full bg-genshin-detail-bg">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-genshin-detail-border shrink-0">
      <h2 class="text-genshin-detail-text text-lg font-semibold leading-tight">
        Total Materials Needed
      </h2>
      <p class="text-genshin-detail-muted text-xs mt-0.5">
        Across all tracked characters
      </p>
    </div>

    <!-- Material list (scrollable) -->
    <div class="flex-1 overflow-y-auto py-2">
      <template v-if="totalMaterials.length > 0">
        <MaterialRow
          v-for="mat in totalMaterials"
          :key="mat.name"
          :name="mat.name"
          :count="mat.count"
          :is-mora="mat.isMora"
          :icon-url="mat.iconUrl"
        />
      </template>

      <p v-else class="text-genshin-detail-muted text-sm text-center mt-8 px-6 leading-relaxed">
        No materials to show yet.<br>
        <span class="text-xs opacity-70">
          Select characters and set level goals to see totals here.
        </span>
      </p>
    </div>
  </div>
</template>
