<script setup>
/**
 * ArtifactsTab.vue
 *
 * Five artifact slots, each independently levelled from +0 to +20.
 * Each slot also tracks:
 *   - Desired main stat (locked for Flower=HP, Plume=ATK)
 *   - Desired substats and how many the user is farming for
 *
 * Sections are collapsible — click the header to toggle.
 */

import { computed, reactive } from 'vue'
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'
import { getArtifactLevelCost, getArtifactXpCost } from '../../data/levelTables.js'

const { state, currentGoal, updateGoal } = useTrainingGuide()

// Valid artifact level milestones: new substats/upgrades happen every 4 levels
const ARTIFACT_LEVEL_OPTIONS = [0, 4, 8, 12, 16, 20]

// Collapsible state for each slot
const expanded = reactive({ 0: false, 1: false, 2: false, 3: false, 4: false })

// ─── Artifact stat definitions ────────────────────────────────

// Main stats available per slot type
const MAIN_STATS = {
  Flower:  ['HP'],
  Plume:   ['ATK'],
  Sands:   ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'Energy Recharge%'],
  Goblet:  ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'Pyro DMG Bonus%', 'Hydro DMG Bonus%', 'Electro DMG Bonus%', 'Cryo DMG Bonus%', 'Anemo DMG Bonus%', 'Geo DMG Bonus%', 'Dendro DMG Bonus%', 'Physical DMG Bonus%'],
  Circlet: ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'CRIT Rate%', 'CRIT DMG%', 'Healing Bonus%'],
}

// All possible substats (same for every slot)
const ALL_SUBSTATS = [
  'HP', 'ATK', 'DEF',
  'HP%', 'ATK%', 'DEF%',
  'Elemental Mastery', 'Energy Recharge%',
  'CRIT Rate%', 'CRIT DMG%',
]

// Slots where main stat is locked (only one option)
function isMainStatLocked(slot) {
  return slot === 'Flower' || slot === 'Plume'
}

// ─── Actions ──────────────────────────────────────────────────

function setArtifactLevel(slotIndex, field, val) {
  updateGoal(state.selectedCharacter, goal => {
    goal.artifacts[slotIndex][field] = val
  })
}

function setMainStat(slotIndex, val) {
  updateGoal(state.selectedCharacter, goal => {
    goal.artifacts[slotIndex].mainStat = val || null
  })
}

function toggleSubstat(slotIndex, stat) {
  updateGoal(state.selectedCharacter, goal => {
    const artifact = goal.artifacts[slotIndex]
    // Migrate legacy data: ensure arrays exist
    if (!artifact.desiredSubstats) artifact.desiredSubstats = []

    const idx = artifact.desiredSubstats.indexOf(stat)
    if (idx === -1) {
      // Max 4 substats per artifact
      if (artifact.desiredSubstats.length < 4) {
        artifact.desiredSubstats.push(stat)
      }
    } else {
      artifact.desiredSubstats.splice(idx, 1)
    }
    // Keep targetSubstatCount within valid range
    if ((artifact.targetSubstatCount ?? 0) > artifact.desiredSubstats.length) {
      artifact.targetSubstatCount = artifact.desiredSubstats.length
    }
  })
}

function setTargetSubstatCount(slotIndex, val) {
  updateGoal(state.selectedCharacter, goal => {
    goal.artifacts[slotIndex].targetSubstatCount = val
  })
}

// ─── Cost calculations ────────────────────────────────────────

function snapToMilestone(lvl) {
  const milestones = ARTIFACT_LEVEL_OPTIONS
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i] <= lvl) return milestones[i]
  }
  return 0
}

function slotMora(artifact) {
  const current = snapToMilestone(artifact.currentLevel)
  const target = artifact.targetLevel
  if (current >= target) return 0
  return getArtifactLevelCost(current, target)
}

function slotXp(artifact) {
  const current = snapToMilestone(artifact.currentLevel)
  const target = artifact.targetLevel
  if (current >= target) return 0
  return getArtifactXpCost(current, target)
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

/**
 * Returns substats available for selection, excluding the chosen main stat
 * (you can't roll a substat that matches the main stat).
 */
function availableSubstats(artifact) {
  const main = artifact.mainStat
  if (!main) return ALL_SUBSTATS
  // Flat HP/ATK can coexist with HP%/ATK% as main, but same-name stats can't
  return ALL_SUBSTATS.filter(s => s !== main)
}

/** Summary line for collapsed slot */
function slotSummary(artifact) {
  const parts = []
  if (artifact.mainStat && !isMainStatLocked(artifact.slot)) {
    parts.push(artifact.mainStat)
  }
  const subs = artifact.desiredSubstats?.length ?? 0
  const target = artifact.targetSubstatCount ?? 0
  if (subs > 0) {
    parts.push(`${target}/${subs} substats`)
  }
  return parts.join(' · ')
}
</script>

<template>
  <div v-if="currentGoal">
    <!-- Total Mora + XP banner -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-genshin-detail-border bg-genshin-detail-card/50">
      <span class="text-[11px] text-genshin-detail-muted uppercase tracking-wide">Total (artifacts)</span>
      <div class="text-right">
        <span class="text-genshin-gold font-semibold text-sm">{{ totalMora.toLocaleString() }} Mora</span>
        <span class="block text-genshin-detail-muted text-[11px]">{{ totalXp.toLocaleString() }} EXP</span>
      </div>
    </div>

    <!-- One collapsible row per artifact slot -->
    <div
      v-for="(artifact, idx) in currentGoal.artifacts"
      :key="artifact.slot"
      class="border-b border-genshin-detail-border/50 last:border-0"
    >
      <!-- Slot header (clickable to toggle) -->
      <div
        class="flex items-center gap-3 px-5 py-3 cursor-pointer select-none hover:bg-genshin-detail-card/40 transition-colors"
        @click="expanded[idx] = !expanded[idx]"
      >
        <!-- Chevron -->
        <span class="text-genshin-detail-muted text-xs w-3 shrink-0">{{ expanded[idx] ? '▾' : '▸' }}</span>

        <!-- Slot icon + name -->
        <div class="flex items-center gap-2 w-24 shrink-0">
          <span class="text-lg">{{ SLOT_ICONS[artifact.slot] ?? '🔮' }}</span>
          <span class="text-sm text-genshin-detail-text">{{ artifact.slot }}</span>
        </div>

        <!-- Level display -->
        <span class="text-genshin-detail-muted text-xs">
          +{{ artifact.currentLevel }} → +{{ artifact.targetLevel }}
        </span>

        <!-- Collapsed summary (main stat + substat count) -->
        <span v-if="!expanded[idx] && slotSummary(artifact)" class="text-genshin-detail-muted text-[11px] ml-auto truncate max-w-40">
          {{ slotSummary(artifact) }}
        </span>

        <!-- Mora + XP cost -->
        <div class="ml-auto text-right shrink-0">
          <template v-if="slotMora(artifact) > 0">
            <span class="text-genshin-gold text-xs font-medium">
              {{ slotMora(artifact).toLocaleString() }} Mora
            </span>
          </template>
          <span v-else class="text-genshin-detail-muted text-xs">Done</span>
        </div>
      </div>

      <!-- Expanded content -->
      <div v-show="expanded[idx]" class="px-5 pb-4 pt-1 ml-5 border-l border-genshin-detail-border/30">

        <!-- Level selectors -->
        <div class="flex items-center gap-3 mb-4">
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] text-genshin-detail-muted">From</label>
            <select
              :value="artifact.currentLevel"
              @change="setArtifactLevel(idx, 'currentLevel', parseInt($event.target.value, 10))"
              class="bg-white/60 border border-genshin-detail-border rounded px-2 py-1 text-genshin-detail-text text-xs
                     focus:outline-none focus:border-genshin-gold cursor-pointer w-16 text-center"
            >
              <option v-for="lvl in ARTIFACT_LEVEL_OPTIONS" :key="lvl" :value="lvl">+{{ lvl }}</option>
            </select>
          </div>

          <span class="text-genshin-detail-muted text-sm mt-3">→</span>

          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] text-genshin-detail-muted">To</label>
            <select
              :value="artifact.targetLevel"
              @change="setArtifactLevel(idx, 'targetLevel', parseInt($event.target.value, 10))"
              class="bg-white/60 border border-genshin-detail-border rounded px-2 py-1 text-genshin-detail-text text-xs
                     focus:outline-none focus:border-genshin-gold cursor-pointer w-16 text-center"
            >
              <option
                v-for="lvl in ARTIFACT_LEVEL_OPTIONS.filter(l => l > artifact.currentLevel)"
                :key="lvl"
                :value="lvl"
              >+{{ lvl }}</option>
            </select>
          </div>

          <!-- XP display inline -->
          <div v-if="slotXp(artifact) > 0" class="ml-auto text-right">
            <span class="text-genshin-detail-muted text-[11px]">{{ slotXp(artifact).toLocaleString() }} EXP</span>
          </div>
        </div>

        <!-- Main stat selector -->
        <div class="mb-3">
          <label class="text-[10px] text-genshin-detail-muted uppercase tracking-wide block mb-1">Main Stat</label>
          <template v-if="isMainStatLocked(artifact.slot)">
            <span class="text-genshin-detail-text text-xs bg-white/60 border border-genshin-detail-border rounded px-2 py-1 inline-block opacity-70">
              {{ artifact.mainStat }} (fixed)
            </span>
          </template>
          <select
            v-else
            :value="artifact.mainStat ?? ''"
            @change="setMainStat(idx, $event.target.value)"
            class="bg-white/60 border border-genshin-detail-border rounded px-2 py-1 text-genshin-detail-text text-xs
                   focus:outline-none focus:border-genshin-gold cursor-pointer"
          >
            <option value="">— Not set —</option>
            <option v-for="stat in MAIN_STATS[artifact.slot]" :key="stat" :value="stat">{{ stat }}</option>
          </select>
        </div>

        <!-- Desired substats -->
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <label class="text-[10px] text-genshin-detail-muted uppercase tracking-wide">Desired Substats</label>
            <!-- How many of the desired substats the user is farming for -->
            <template v-if="(artifact.desiredSubstats?.length ?? 0) > 0">
              <span class="text-[10px] text-genshin-detail-muted">— farming for</span>
              <select
                :value="artifact.targetSubstatCount ?? 0"
                @change="setTargetSubstatCount(idx, parseInt($event.target.value, 10))"
                class="bg-white/60 border border-genshin-detail-border rounded px-1 py-0.5 text-genshin-detail-text text-[11px]
                       focus:outline-none focus:border-genshin-gold cursor-pointer w-10 text-center"
              >
                <option v-for="n in artifact.desiredSubstats.length" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="text-[10px] text-genshin-detail-muted">of {{ artifact.desiredSubstats.length }}</span>
            </template>
          </div>

          <!-- Substat chip toggles -->
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="stat in availableSubstats(artifact)"
              :key="stat"
              @click.stop="toggleSubstat(idx, stat)"
              class="px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer"
              :class="(artifact.desiredSubstats ?? []).includes(stat)
                ? 'bg-genshin-gold/20 border-genshin-gold text-genshin-gold'
                : 'bg-white/60 border-genshin-detail-border text-genshin-detail-muted hover:border-genshin-gold/50'"
            >
              {{ stat }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
