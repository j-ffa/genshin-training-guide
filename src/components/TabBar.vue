<script setup>
/**
 * TabBar.vue
 *
 * Four tabs matching the in-game Training Guide layout.
 * Uses v-model for two-way binding with the parent's activeTab state.
 */

const props = defineProps({
  modelValue: { type: String, required: true },
  /** Object keyed by tab id → boolean, true if that tab's goals are fully complete */
  completionStatus: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])

const TABS = [
  { id: 'characterLevel', label: 'Character Level' },
  { id: 'weapon',         label: 'Weapon' },
  { id: 'artifacts',      label: 'Artifacts' },
  { id: 'talents',        label: 'Talents' },
]
</script>

<template>
  <div class="flex items-center gap-2 px-6 py-3 border-b border-genshin-detail-border shrink-0">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      @click="emit('update:modelValue', tab.id)"
      class="flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors duration-150 rounded-full cursor-pointer whitespace-nowrap"
      :class="modelValue === tab.id
        ? 'bg-genshin-panel text-genshin-text'
        : 'bg-genshin-detail-card text-genshin-detail-muted hover:bg-genshin-detail-card/70'"
    >
      <span>{{ tab.label }}</span>
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :class="completionStatus[tab.id] ? 'bg-genshin-green' : 'bg-genshin-red'"
      ></span>
    </button>
  </div>
</template>
