<script setup>
import { onMounted } from 'vue'
import { useTrainingGuide } from './composables/useTrainingGuide.js'
import CharacterGrid from './components/CharacterGrid.vue'
import DetailPanel from './components/DetailPanel.vue'

const { loadFromStorage } = useTrainingGuide()

// Restore saved state from localStorage when the app first loads
onMounted(() => loadFromStorage())
</script>

<template>
  <!-- Full-viewport dark layout: fixed-width left grid, flexible right panel -->
  <div class="flex h-screen overflow-hidden bg-genshin-bg text-genshin-text">
    <CharacterGrid />
    <DetailPanel class="flex-1 min-w-0" />
  </div>
</template>
