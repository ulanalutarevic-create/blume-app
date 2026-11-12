import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const KEY = 'blume_wishlist'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const ids = ref(load())
  watch(ids, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

  const count = computed(() => ids.value.length)

  function has(id) {
    return ids.value.includes(id)
  }

  function toggle(id) {
    if (has(id)) ids.value = ids.value.filter((x) => x !== id)
    else ids.value.push(id)
  }

  return { ids, count, has, toggle }
})
