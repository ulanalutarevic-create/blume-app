import { defineStore } from 'pinia'
import { ref } from 'vue'

let seq = 0

export const useToastStore = defineStore('toast', () => {
  const items = ref([])

  function push(message, type = 'ok') {
    const id = ++seq
    items.value.push({ id, message, type })
    setTimeout(() => dismiss(id), 2600)
  }

  function dismiss(id) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { items, push, dismiss }
})
