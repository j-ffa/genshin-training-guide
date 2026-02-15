<script setup>
/**
 * TalentsTab.vue
 *
 * Three talent sections — Normal Attack, Elemental Skill, Elemental Burst.
 * Each can be levelled independently from 1 to 10.
 *
 * All three talents of a character use the same material types
 * (same talent books and boss drops), but costs are calculated
 * independently per talent based on its own level range.
 */

import { computed } from 'vue'
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'
import { getTalentCosts, getTalentNames } from '../../data/genshinData.js'
import LevelRangeInput from '../shared/LevelRangeInput.vue'
import MaterialRow from '../shared/MaterialRow.vue'

const { state, currentGoal, updateGoal } = useTrainingGuide()

// Talent levels go from 1 (base) to 10 (max, requires Crown of Insight)
const TALENT_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Human-readable names from genshin-db (e.g. "Dough-Fu", "Guoba Attack", "Pyronado")
const talentNames = computed(() =>
  state.selectedCharacter ? getTalentNames(state.selectedCharacter) : null
)

// ─── Level update actions ─────────────────────────────────────

function setTalentLevel(talentKey, field, val) {
  updateGoal(state.selectedCharacter, goal => {
    goal.talents[talentKey][field] = val
  })
}

// ─── Material calculation (per talent) ───────────────────────

/**
 * Returns the material list for one talent's level range.
 * talentKey: 'normalAttack' | 'skill' | 'burst'
 */
function getTalentMaterials(talentKey) {
  if (!currentGoal.value || !state.selectedCharacter) return []
  const { currentLevel, targetLevel } = currentGoal.value.talents[talentKey]
  if (currentLevel >= targetLevel) return []
  return getTalentCosts(state.selectedCharacter, currentLevel, targetLevel)
}

// Computed for each talent so they update reactively
const normalAttackMaterials = computed(() => getTalentMaterials('normalAttack'))
const skillMaterials        = computed(() => getTalentMaterials('skill'))
const burstMaterials        = computed(() => getTalentMaterials('burst'))

// Config array used to render the three sections in the template
const TALENT_SECTIONS = [
  {
    key:       'normalAttack',
    fallback:  'Normal Attack',
    materials: normalAttackMaterials,
  },
  {
    key:       'skill',
    fallback:  'Elemental Skill',
    materials: skillMaterials,
  },
  {
    key:       'burst',
    fallback:  'Elemental Burst',
    materials: burstMaterials,
  },
]
</script>

<template>
  <div v-if="currentGoal && talentNames">
    <div
      v-for="section in TALENT_SECTIONS"
      :key="section.key"
      class="border-b border-genshin-border last:border-0"
    >
      <!-- Talent section header -->
      <div class="px-5 pt-4 pb-0">
        <h3 class="text-genshin-text text-sm font-medium">
          {{ talentNames[section.key] ?? section.fallback }}
        </h3>
        <p class="text-genshin-muted text-[11px] capitalize">{{ section.key.replace('normalAttack', 'Normal Attack') }}</p>
      </div>

      <!-- Level range input -->
      <LevelRangeInput
        :current-level="currentGoal.talents[section.key].currentLevel"
        :target-level="currentGoal.talents[section.key].targetLevel"
        :target-options="TALENT_LEVELS"
        current-label="Current"
        target-label="Target"
        :current-min="1"
        :current-max="9"
        @update:current-level="setTalentLevel(section.key, 'currentLevel', $event)"
        @update:target-level="setTalentLevel(section.key, 'targetLevel', $event)"
      />

      <!-- Materials for this talent -->
      <div
        v-if="currentGoal.talents[section.key].currentLevel >= currentGoal.talents[section.key].targetLevel"
        class="px-5 pb-4 text-genshin-muted text-xs"
      >
        Already at target level.
      </div>
      <div v-else class="pb-2">
        <MaterialRow
          v-for="mat in section.materials.value"
          :key="mat.name"
          :name="mat.name"
          :count="mat.count"
          :is-mora="mat.name === 'Mora'"
        />
      </div>
    </div>
  </div>
</template>
