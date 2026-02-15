<script setup>
/**
 * LevelRangeInput.vue
 *
 * A reusable "Current → Target" level selector used in all four tabs.
 *
 * Shows:
 *   Current level: [number input]   →   Level up to: [dropdown of valid targets]
 *
 * The parent passes the valid target options (e.g. [20, 40, 50, 60, 70, 80, 90]
 * for characters, or 1-10 for talents).
 *
 * v-model:currentLevel and v-model:targetLevel are used for two-way binding.
 */
import { computed } from 'vue'

const props = defineProps({
  currentLevel: { type: Number,  required: true },
  targetLevel:  { type: Number,  required: true },
  /** All valid level options for the target dropdown */
  targetOptions: { type: Array, required: true },
  /** Label shown above the current level input */
  currentLabel: { type: String, default: 'Current level' },
  /** Label shown above the target level input */
  targetLabel:  { type: String, default: 'Level up to' },
  /** Min value for the current level input */
  currentMin:   { type: Number, default: 1 },
  /** Max value for the current level input (usually targetLevel - 1) */
  currentMax:   { type: Number, default: 89 },
})

const emit = defineEmits(['update:currentLevel', 'update:targetLevel'])

// Only show target options that are greater than the current level
const validTargetOptions = computed(() =>
  props.targetOptions.filter(lvl => lvl > props.currentLevel)
)

function onCurrentInput(e) {
  const val = parseInt(e.target.value, 10)
  if (!isNaN(val)) {
    const clamped = Math.max(props.currentMin, Math.min(val, props.currentMax))
    emit('update:currentLevel', clamped)
    // If target is now <= current, bump it to the next valid option
    if (props.targetLevel <= clamped) {
      const next = props.targetOptions.find(o => o > clamped)
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
      <input
        type="number"
        :value="currentLevel"
        :min="currentMin"
        :max="currentMax"
        @change="onCurrentInput"
        class="w-16 bg-genshin-panel2 border border-genshin-border rounded px-2 py-1.5 text-genshin-text text-sm text-center
               focus:outline-none focus:border-genshin-gold appearance-none"
      />
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
