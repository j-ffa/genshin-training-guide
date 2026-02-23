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
  { id: 'characterLevel', label: 'Character Level', icon: '⚔️' },
  { id: 'weapon',         label: 'Weapon',           icon: '🗡️' },
  { id: 'artifacts',      label: 'Artifacts',         icon: '🔮' },
  { id: 'talents',        label: 'Talents',           icon: '✨' },
]
</script>

<template>
  <div class="flex border-b border-genshin-border shrink-0">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      @click="emit('update:modelValue', tab.id)"
      class="flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors duration-150 border-b-2 cursor-pointer whitespace-nowrap"
      :class="modelValue === tab.id
        ? 'border-genshin-gold text-genshin-gold'
        : 'border-transparent text-genshin-muted hover:text-genshin-text'"
    >
      <span>{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
      <span v-if="completionStatus[tab.id]" class="w-1.5 h-1.5 rounded-full bg-genshin-green shrink-0" title="Complete"></span>
    </button>
  </div>
</template>
