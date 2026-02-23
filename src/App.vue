<script setup>
import CharacterGrid from './components/CharacterGrid.vue'
import DetailPanel from './components/DetailPanel.vue'
</script>

<template>
  <!-- Full-viewport dark layout: fixed-width left grid, flexible right panel -->
  <div class="flex h-screen overflow-hidden bg-genshin-bg text-genshin-text">
    <CharacterGrid class="w-[38%] min-w-[320px] max-w-[520px] shrink-0" />
    <DetailPanel class="flex-1 min-w-0" />
  </div>
</template>
