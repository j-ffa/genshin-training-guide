<script setup>
/**
 * CharacterLevelTab.vue
 *
 * Shows the materials needed to level a character from their current
 * level to their target level, including:
 *
 * - Mora (combined from leveling XP cost + ascension phase costs)
 * - Hero's Wits (XP book requirement, rounded up to whole books)
 * - All ascension phase materials (gems, boss drops, local specialty, enemy drops)
 *
 * The user can adjust current and target levels using the LevelRangeInput.
 */

import { computed } from 'vue'
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'
import { getCharacterAscensionCosts } from '../../data/genshinData.js'
import { getCharacterLevelUpCosts, CHARACTER_CUMULATIVE_EXP } from '../../data/levelTables.js'
import LevelRangeInput from '../shared/LevelRangeInput.vue'
import MaterialRow from '../shared/MaterialRow.vue'

const { state, currentGoal, updateGoal } = useTrainingGuide()

// Valid target level options for the dropdown
const TARGET_LEVEL_OPTIONS = Object.keys(CHARACTER_CUMULATIVE_EXP)
  .map(Number)
  .filter(n => n > 1)  // exclude level 1

// ─── Level range input bindings ─────────────────────────────

function setCurrentLevel(val) {
  updateGoal(state.selectedCharacter, goal => { goal.currentLevel = val })
}

function setTargetLevel(val) {
  updateGoal(state.selectedCharacter, goal => { goal.targetLevel = val })
}

// ─── Material calculations ───────────────────────────────────

/**
 * Combines the ascension costs and level-up costs into one flat material list.
 * Mora from both sources is merged into a single entry.
 */
const requiredMaterials = computed(() => {
  if (!currentGoal.value) return []

  const { currentLevel, targetLevel } = currentGoal.value

  if (currentLevel >= targetLevel) return []

  // Ascension material costs (gems, boss drops, local specialty, enemy drops + ascension Mora)
  const ascensionCosts = getCharacterAscensionCosts(
    state.selectedCharacter,
    currentLevel,
    targetLevel
  )

  // XP/Mora cost from leveling
  const { mora: levelMora, heroWits } = getCharacterLevelUpCosts(currentLevel, targetLevel)

  // Merge everything into one list
  // We'll build the final list as: Mora first, then Hero's Wits, then ascension materials
  const merged = []

  // Total Mora = leveling mora + ascension mora (which is already in ascensionCosts)
  let totalMora = levelMora
  const ascensionWithoutMora = []
  for (const item of ascensionCosts) {
    if (item.name === 'Mora') {
      totalMora += item.count
    } else {
      ascensionWithoutMora.push({ ...item })
    }
  }

  if (totalMora > 0) {
    merged.push({ name: 'Mora', count: totalMora, isMora: true })
  }

  if (heroWits > 0) {
    merged.push({ name: "Hero's Wit", count: heroWits, isMora: false })
  }

  merged.push(...ascensionWithoutMora)

  return merged
})

const hasNoChange = computed(() =>
  !currentGoal.value || currentGoal.value.currentLevel >= currentGoal.value.targetLevel
)
</script>

<template>
  <div v-if="currentGoal">
    <!-- Level range selector -->
    <LevelRangeInput
      :current-level="currentGoal.currentLevel"
      :target-level="currentGoal.targetLevel"
      :target-options="TARGET_LEVEL_OPTIONS"
      current-label="Current level"
      target-label="Level up to"
      :current-min="1"
      :current-max="89"
      @update:current-level="setCurrentLevel"
      @update:target-level="setTargetLevel"
    />

    <!-- Material list -->
    <div v-if="hasNoChange" class="p-5 text-genshin-muted text-sm">
      Already at target level.
    </div>

    <div v-else>
      <div class="px-4 pt-3 pb-1">
        <p class="text-[11px] text-genshin-muted uppercase tracking-wide">
          Materials needed (Lv. {{ currentGoal.currentLevel }} → {{ currentGoal.targetLevel }})
        </p>
      </div>

      <MaterialRow
        v-for="mat in requiredMaterials"
        :key="mat.name"
        :name="mat.name"
        :count="mat.count"
        :is-mora="mat.isMora ?? false"
      />
    </div>
  </div>
</template>
