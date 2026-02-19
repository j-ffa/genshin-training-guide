<script setup>
/**
 * ArtifactsTab.vue
 *
 * Five artifact slots, each independently levelled from +0 to +20.
 * Valid level milestones every 4 levels: 0, 4, 8, 12, 16, 20.
 *
 * We show the Mora cost per slot and the total across all five.
 * (Artifact EXP fodder is highly variable and not modelled here —
 * the Mora cost is the main planning resource since it's shared with
 * everything else in the game.)
 *
 * Note: The in-game Training Guide also only tracks artifact levels,
 * not substat rolls — so this matches the game's own approach.
 */

import { computed } from 'vue'
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'
import { getArtifactLevelCost, getArtifactXpCost } from '../../data/levelTables.js'

const { state, currentGoal, updateGoal } = useTrainingGuide()

// Valid artifact level milestones: new substats/upgrades happen every 4 levels
const ARTIFACT_LEVEL_OPTIONS = [0, 4, 8, 12, 16, 20]

function setArtifactLevel(slotIndex, field, val) {
  updateGoal(state.selectedCharacter, goal => {
    goal.artifacts[slotIndex][field] = val
  })
}

/**
 * Mora cost for a single artifact slot.
 * We snap currentLevel down to the nearest milestone for the table lookup.
 */
function slotMora(artifact) {
  const current = snapToMilestone(artifact.currentLevel)
  const target  = artifact.targetLevel
  if (current >= target) return 0
  return getArtifactLevelCost(current, target)
}

/** Artifact XP (fodder) cost for a single slot. */
function slotXp(artifact) {
  const current = snapToMilestone(artifact.currentLevel)
  const target  = artifact.targetLevel
  if (current >= target) return 0
  return getArtifactXpCost(current, target)
}

/** Snaps a level to the nearest lower artifact milestone */
function snapToMilestone(lvl) {
  const milestones = ARTIFACT_LEVEL_OPTIONS
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i] <= lvl) return milestones[i]
  }
  return 0
}

const totalMora = computed(() => {
  if (!currentGoal.value) return 0
  return currentGoal.value.artifacts.reduce((sum, a) => sum + slotMora(a), 0)
})

const totalXp = computed(() => {
  if (!currentGoal.value) return 0
  return currentGoal.value.artifacts.reduce((sum, a) => sum + slotXp(a), 0)
})

// Emoji icons for each artifact slot type
const SLOT_ICONS = {
  Flower:  '🌸',
  Plume:   '🪶',
  Sands:   '⌛',
  Goblet:  '🏺',
  Circlet: '👑',
}
</script>

<template>
  <div v-if="currentGoal">
    <!-- Total Mora + XP banner -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-genshin-border bg-genshin-panel2/50">
      <span class="text-[11px] text-genshin-muted uppercase tracking-wide">Total (artifacts)</span>
      <div class="text-right">
        <span class="text-genshin-gold font-semibold text-sm">{{ totalMora.toLocaleString() }} Mora</span>
        <span class="block text-genshin-muted text-[11px]">{{ totalXp.toLocaleString() }} EXP</span>
      </div>
    </div>

    <!-- One row per artifact slot -->
    <div
      v-for="(artifact, idx) in currentGoal.artifacts"
      :key="artifact.slot"
      class="flex items-center gap-4 px-5 py-3 border-b border-genshin-border/50 last:border-0"
    >
      <!-- Slot icon + name -->
      <div class="flex items-center gap-2 w-28 shrink-0">
        <span class="text-lg">{{ SLOT_ICONS[artifact.slot] ?? '🔮' }}</span>
        <span class="text-sm text-genshin-text">{{ artifact.slot }}</span>
      </div>

      <!-- Current level (dropdown of milestones) -->
      <div class="flex flex-col gap-0.5">
        <label class="text-[10px] text-genshin-muted">From</label>
        <select
          :value="artifact.currentLevel"
          @change="setArtifactLevel(idx, 'currentLevel', parseInt($event.target.value, 10))"
          class="bg-genshin-panel2 border border-genshin-border rounded px-2 py-1 text-genshin-text text-xs
                 focus:outline-none focus:border-genshin-gold cursor-pointer w-16 text-center"
        >
          <option v-for="lvl in ARTIFACT_LEVEL_OPTIONS" :key="lvl" :value="lvl">+{{ lvl }}</option>
        </select>
      </div>

      <span class="text-genshin-muted text-sm">→</span>

      <!-- Target level (dropdown of milestones > current) -->
      <div class="flex flex-col gap-0.5">
        <label class="text-[10px] text-genshin-muted">To</label>
        <select
          :value="artifact.targetLevel"
          @change="setArtifactLevel(idx, 'targetLevel', parseInt($event.target.value, 10))"
          class="bg-genshin-panel2 border border-genshin-border rounded px-2 py-1 text-genshin-text text-xs
                 focus:outline-none focus:border-genshin-gold cursor-pointer w-16 text-center"
        >
          <option
            v-for="lvl in ARTIFACT_LEVEL_OPTIONS.filter(l => l > artifact.currentLevel)"
            :key="lvl"
            :value="lvl"
          >+{{ lvl }}</option>
        </select>
      </div>

      <!-- Mora + XP cost for this slot -->
      <div class="flex-1 text-right">
        <template v-if="slotMora(artifact) > 0">
          <span class="text-genshin-gold text-sm font-medium">
            {{ slotMora(artifact).toLocaleString() }} Mora
          </span>
          <span class="block text-genshin-muted text-[11px]">
            {{ slotXp(artifact).toLocaleString() }} EXP
          </span>
        </template>
        <span v-else class="text-genshin-muted text-xs">Done</span>
      </div>
    </div>
  </div>
</template>
