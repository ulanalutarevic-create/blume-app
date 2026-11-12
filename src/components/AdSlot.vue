<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'banner',
    validator: (value) => ['banner', 'sidebar'].includes(value)
  },
  width: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Рекламное место'
  }
})

const presets = {
  banner: { width: '100%', height: '7.5rem' },
  sidebar: { width: '16rem', height: '18rem' }
}

const boxStyle = computed(() => {
  const preset = presets[props.size] || presets.banner
  return {
    width: props.width || preset.width,
    height: props.height || preset.height,
    maxWidth: '100%'
  }
})
</script>

<template>
  <aside
    class="ad-slot mx-auto my-6 flex w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
    :style="boxStyle"
    role="complementary"
    :aria-label="label"
  >
    <span class="text-sm tracking-wide text-slate-400">{{ label }}</span>
  </aside>
</template>
