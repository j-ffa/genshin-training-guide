<script setup>
/**
 * WeaponTab.vue
 *
 * Lets the user:
 *  1. Select a weapon (filtered to the character's weapon type)
 *  2. Set current and target weapon levels
 *  3. See the ascension materials + Mystic Enhancement Ores + Mora required
 */

import { computed, ref } from 'vue'
import genshindb from 'genshin-db'
import { useTrainingGuide } from '../../composables/useTrainingGuide.js'
import { getCharacterWeaponType, getAllWeaponNames, getWeaponAscensionCosts, getWeaponIconUrl, getMaterialIconUrl } from '../../data/genshinData.js'
import { getWeaponLevelUpCosts, WEAPON_5STAR_CUMULATIVE_EXP } from '../../data/levelTables.js'
import LevelRangeInput from '../shared/LevelRangeInput.vue'
import MaterialRow from '../shared/MaterialRow.vue'

const { state, currentGoal, updateGoal } = useTrainingGuide()

const LEVEL_OPTIONS = Object.keys(WEAPON_5STAR_CUMULATIVE_EXP).map(Number)
const TARGET_LEVEL_OPTIONS = LEVEL_OPTIONS.filter(n => n > 1)

// ─── Weapon selector ────────────────────────────────────────

// Genshin-db weapon type code for the selected character (e.g. "WEAPON_POLE")
const charWeaponType = computed(() =>
  state.selectedCharacter ? getCharacterWeaponType(state.selectedCharacter) : null
)

// All weapons matching the character's weapon type, sorted alphabetically
const compatibleWeapons = computed(() => {
  if (!charWeaponType.value) return []
  return getAllWeaponNames()
    .filter(name => genshindb.weapons(name)?.weaponType === charWeaponType.value)
    .sort()
})

const weaponImgFailed = ref(false)

const selectedWeaponIcon = computed(() => {
  const name = currentGoal.value?.weapon
  if (!name) return null
  return getWeaponIconUrl(name)
})

function setWeapon(e) {
  weaponImgFailed.value = false
  updateGoal(state.selectedCharacter, goal => {
    goal.weapon = e.target.value || null
  })
}

function setWeaponCurrentLevel(val) {
  updateGoal(state.selectedCharacter, goal => { goal.weaponCurrentLevel = val })
}

function setWeaponTargetLevel(val) {
  updateGoal(state.selectedCharacter, goal => { goal.weaponTargetLevel = val })
}

// ─── Material calculation ────────────────────────────────────

// Get the selected weapon's rarity (needed for XP table selection)
const weaponRarity = computed(() => {
  const name = currentGoal.value?.weapon
  if (!name) return 5
  return genshindb.weapons(name)?.rarity ?? 5
})

const requiredMaterials = computed(() => {
  if (!currentGoal.value?.weapon) return []

  const { weapon, weaponCurrentLevel, weaponTargetLevel } = currentGoal.value
  if (weaponCurrentLevel >= weaponTargetLevel) return []

  const ascensionCosts = getWeaponAscensionCosts(weapon, weaponCurrentLevel, weaponTargetLevel)
  const { mora: levelMora, mysticOres } = getWeaponLevelUpCosts(
    weaponCurrentLevel,
    weaponTargetLevel,
    weaponRarity.value
  )

  const merged = []
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
  if (mysticOres > 0) {
    merged.push({ name: 'Mystic Enhancement Ore', count: mysticOres, isMora: false })
  }
  merged.push(...ascensionWithoutMora)

  return merged
})

const atTarget = computed(() =>
  currentGoal.value?.weaponCurrentLevel >= currentGoal.value?.weaponTargetLevel
)
</script>

<template>
  <div v-if="currentGoal" class="flex flex-col">

    <!-- Weapon selector -->
    <div class="px-5 py-4 border-b border-genshin-detail-border">
      <label class="block text-[11px] text-genshin-detail-muted uppercase tracking-wide mb-1.5">
        Weapon
      </label>
      <div class="flex items-center gap-3">
        <select
          :value="currentGoal.weapon ?? ''"
          @change="setWeapon"
          class="flex-1 bg-white/60 border border-genshin-detail-border rounded px-3 py-2 text-genshin-detail-text text-sm
                 focus:outline-none focus:border-genshin-gold cursor-pointer"
        >
          <option value="">— Select a weapon —</option>
          <option v-for="name in compatibleWeapons" :key="name" :value="name">{{ name }}</option>
        </select>
        <img
          v-if="selectedWeaponIcon && !weaponImgFailed"
          :src="selectedWeaponIcon"
          :alt="currentGoal.weapon"
          class="w-12 h-12 rounded object-cover shrink-0"
          @error="weaponImgFailed = true"
        />
      </div>
    </div>

    <!-- Level range (only visible once a weapon is selected) -->
    <template v-if="currentGoal.weapon">
      <LevelRangeInput
        :current-level="currentGoal.weaponCurrentLevel"
        :target-level="currentGoal.weaponTargetLevel"
        :current-options="LEVEL_OPTIONS"
        :target-options="TARGET_LEVEL_OPTIONS"
        current-label="Current level"
        target-label="Level up to"
        @update:current-level="setWeaponCurrentLevel"
        @update:target-level="setWeaponTargetLevel"
      />

      <div v-if="atTarget" class="p-5 text-genshin-detail-muted text-sm">
        Already at target level.
      </div>

      <div v-else>
        <div class="px-4 pt-3 pb-1">
          <p class="text-[11px] text-genshin-detail-muted uppercase tracking-wide">
            Materials needed (Lv. {{ currentGoal.weaponCurrentLevel }} → {{ currentGoal.weaponTargetLevel }})
          </p>
        </div>
        <MaterialRow
          v-for="mat in requiredMaterials"
          :key="mat.name"
          :name="mat.name"
          :count="mat.count"
          :is-mora="mat.isMora ?? false"
          :icon-url="getMaterialIconUrl(mat.name)"
        />
      </div>
    </template>
  </div>
</template>
