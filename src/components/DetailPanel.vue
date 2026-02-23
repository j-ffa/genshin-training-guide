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

import { ref, watch, computed } from 'vue'
import { useTrainingGuide } from '../composables/useTrainingGuide.js'
import DetailHeader from './DetailHeader.vue'
import TabBar from './TabBar.vue'
import CharacterLevelTab from './tabs/CharacterLevelTab.vue'
import WeaponTab from './tabs/WeaponTab.vue'
import ArtifactsTab from './tabs/ArtifactsTab.vue'
import TalentsTab from './tabs/TalentsTab.vue'

const { state, currentGoal } = useTrainingGuide()

const activeTab = ref('characterLevel')

// Reset to first tab whenever a different character is selected
watch(() => state.selectedCharacter, () => {
  activeTab.value = 'characterLevel'
})

/**
 * Completion status for each tab — true when current >= target for all goals in that tab.
 * Used to show green dots on the tab bar.
 */
const tabCompletion = computed(() => {
  const goal = currentGoal.value
  if (!goal) return {}

  const charDone = goal.currentLevel >= goal.targetLevel

  const weaponDone = !goal.weapon || goal.weaponCurrentLevel >= goal.weaponTargetLevel

  const artifactsDone = goal.artifacts.every(a => a.currentLevel >= a.targetLevel)

  const talentsDone = Object.values(goal.talents).every(t => t.currentLevel >= t.targetLevel)

  return {
    characterLevel: charDone,
    weapon: weaponDone,
    artifacts: artifactsDone,
    talents: talentsDone,
  }
})
</script>

<template>
  <!-- No character selected -->
  <div
    v-if="!state.selectedCharacter"
    class="flex items-center justify-center h-full bg-genshin-detail-bg"
  >
    <p class="text-genshin-detail-muted text-sm text-center leading-relaxed">
      Select a character<br>
      <span class="text-xs opacity-70">
        {{ state.ownershipMode ? 'Exit roster edit mode first' : 'from the list on the left' }}
      </span>
    </p>
  </div>

  <!-- Character selected -->
  <div v-else class="flex flex-col h-full bg-genshin-detail-bg text-genshin-detail-text">
    <DetailHeader />

    <TabBar v-model="activeTab" :completion-status="tabCompletion" />

    <!-- Tab content — scrollable -->
    <div class="flex-1 overflow-y-auto">
      <CharacterLevelTab v-if="activeTab === 'characterLevel'" />
      <WeaponTab         v-if="activeTab === 'weapon'" />
      <ArtifactsTab      v-if="activeTab === 'artifacts'" />
      <TalentsTab        v-if="activeTab === 'talents'" />
    </div>
  </div>
</template>
