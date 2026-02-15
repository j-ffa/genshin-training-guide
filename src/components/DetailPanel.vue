<script setup>
/**
 * DetailPanel.vue
 *
 * The right-hand panel showing the selected character's goal information.
 *
 * When no character is selected: shows a placeholder prompt.
 * When a character is selected: shows the header, tab bar, and active tab content.
 *
 * activeTab is local state — which tab is open doesn't need to persist
 * across sessions, and resets to Character Level on each new selection.
 */

import { ref, watch } from 'vue'
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import DetailHeader from './DetailHeader.vue'
import TabBar from './TabBar.vue'
import CharacterLevelTab from './tabs/CharacterLevelTab.vue'
import WeaponTab from './tabs/WeaponTab.vue'
import ArtifactsTab from './tabs/ArtifactsTab.vue'
import TalentsTab from './tabs/TalentsTab.vue'

const { state } = useTrainingGuide()

const activeTab = ref('characterLevel')

// Reset to first tab whenever a different character is selected
watch(() => state.selectedCharacter, () => {
  activeTab.value = 'characterLevel'
})
</script>

<template>
  <!-- No character selected -->
  <div
    v-if="!state.selectedCharacter"
    class="flex items-center justify-center h-full"
  >
    <p class="text-genshin-muted text-sm text-center leading-relaxed">
      Select a character<br>
      <span class="text-xs opacity-70">
        {{ state.ownershipMode ? 'Exit roster edit mode first' : 'from the list on the left' }}
      </span>
    </p>
  </div>

  <!-- Character selected -->
  <div v-else class="flex flex-col h-full">
    <DetailHeader />

    <TabBar v-model="activeTab" />

    <!-- Tab content — scrollable -->
    <div class="flex-1 overflow-y-auto">
      <CharacterLevelTab v-if="activeTab === 'characterLevel'" />
      <WeaponTab         v-if="activeTab === 'weapon'" />
      <ArtifactsTab      v-if="activeTab === 'artifacts'" />
      <TalentsTab        v-if="activeTab === 'talents'" />
    </div>
  </div>
</template>
