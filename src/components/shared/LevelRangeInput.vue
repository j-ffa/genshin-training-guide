<script setup>
/**
 * LevelRangeInput.vue
 *
 * A reusable "Current → Target" level selector used in all four tabs.
 *
 * Shows:
 *   Current level: [dropdown]   →   Level up to: [dropdown of valid targets]
 *
 * The parent passes both current and target options arrays.
 * Optional currentLabels maps level numbers to display suffixes (e.g. ascension phases).
 *
 * v-model:currentLevel and v-model:targetLevel are used for two-way binding.
 */
import { computed } from 'vue'

const props = defineProps({
  currentLevel: { type: Number,  required: true },
  targetLevel:  { type: Number,  required: true },
  /** All valid level options for the current dropdown */
  currentOptions: { type: Array, required: true },
  /** All valid level options for the target dropdown */
  targetOptions: { type: Array, required: true },
  /** Optional display labels for current options, e.g. { 20: 'A1', 40: 'A2' } */
  currentLabels: { type: Object, default: () => ({}) },
  /** Label shown above the current level input */
  currentLabel: { type: String, default: 'Current level' },
  /** Label shown above the target level input */
  targetLabel:  { type: String, default: 'Level up to' },
  /** When true, target options include levels >= current (instead of strictly >) */
  allowEqual: { type: Boolean, default: false },
})

const emit = defineEmits(['update:currentLevel', 'update:targetLevel'])

// Only show target options that are greater than (or >= if allowEqual) the current level
const validTargetOptions = computed(() =>
  props.allowEqual
    ? props.targetOptions.filter(lvl => lvl >= props.currentLevel)
    : props.targetOptions.filter(lvl => lvl > props.currentLevel)
)

function onCurrentChange(e) {
  const val = parseInt(e.target.value, 10)
  if (!isNaN(val)) {
    emit('update:currentLevel', val)
    // If target is now <= current, bump it to the next valid option
    const minTarget = props.allowEqual ? val : val + 1
    if (props.targetLevel < minTarget) {
      const next = props.targetOptions.find(o => o >= minTarget)
      if (next) emit('update:targetLevel', next)
    }
  }
}

function onTargetChange(e) {
  emit('update:targetLevel', parseInt(e.target.value, 10))
}
</script>

<template>
  <div class="flex items-end gap-4 px-5 py-4 border-b border-genshin-border">
    <!-- Current level -->
    <div class="flex flex-col gap-1">
      <label class="text-[11px] text-genshin-muted uppercase tracking-wide">{{ currentLabel }}</label>
      <select
        :value="currentLevel"
        @change="onCurrentChange"
        class="bg-genshin-panel2 border border-genshin-border rounded px-2 py-1.5 text-genshin-text text-sm
               focus:outline-none focus:border-genshin-gold cursor-pointer"
      >
        <option v-for="lvl in currentOptions" :key="lvl" :value="lvl">
          {{ lvl }}{{ currentLabels[lvl] ? ` (${currentLabels[lvl]})` : '' }}
        </option>
      </select>
    </div>

    <!-- Arrow -->
    <div class="pb-2 text-genshin-muted text-lg">→</div>

    <!-- Target level dropdown -->
    <div class="flex flex-col gap-1">
      <label class="text-[11px] text-genshin-muted uppercase tracking-wide">{{ targetLabel }}</label>
      <select
        :value="targetLevel"
        @change="onTargetChange"
        class="bg-genshin-panel2 border border-genshin-border rounded px-2 py-1.5 text-genshin-text text-sm
               focus:outline-none focus:border-genshin-gold cursor-pointer"
      >
        <option
          v-for="lvl in validTargetOptions"
          :key="lvl"
          :value="lvl"
        >
          {{ lvl }}
        </option>
      </select>
    </div>
  </div>
</template>
