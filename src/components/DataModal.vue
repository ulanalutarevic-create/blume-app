<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  item: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])

const form = reactive({
  name: '',
  weight: '',
  price: 0,
  city: 'Минск'
})

watch(
  () => [props.show, props.item],
  () => {
    if (props.item) {
      form.name = props.item.name || ''
      form.weight = props.item.weight || ''
      form.price = props.item.price ?? 0
      form.city = props.item.city || 'Минск'
    } else {
      form.name = ''
      form.weight = ''
      form.price = 0
      form.city = 'Минск'
    }
  },
  { immediate: true }
)

function submit() {
  emit('save', { ...form })
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div v-if="show" class="data-modal" tabindex="-1" @click="onBackdrop" @keydown.esc="emit('close')">
    <div class="data-modal__sheet" role="dialog" aria-modal="true">
      <header class="data-modal__head">
        <h2 class="brand">{{ item ? 'редактировать' : 'добавить' }}</h2>
        <button type="button" class="pill pill--outline data-modal__x" @click="emit('close')">✕</button>
      </header>
      <form class="data-modal__form" @submit.prevent="submit">
        <label>
          <span>название</span>
          <input v-model="form.name" required />
        </label>
        <label>
          <span>вес</span>
          <input v-model="form.weight" placeholder="1100г" required />
        </label>
        <label>
          <span>цена, р.</span>
          <input v-model.number="form.price" type="number" min="0" step="1" required />
        </label>
        <label>
          <span>город</span>
          <input v-model="form.city" required />
        </label>
        <div class="data-modal__actions">
          <button type="button" class="pill pill--outline" @click="emit('close')">отмена</button>
          <button type="submit" class="pill pill--dark">сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>
