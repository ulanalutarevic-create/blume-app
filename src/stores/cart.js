import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { plants } from '../data/plants'

const KEY = 'blume_cart'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function withCatalog(line) {
  const plant = plants.find((p) => p.id === line.id)
  if (!plant) return line
  return {
    ...line,
    name: plant.name,
    price: plant.price,
    weight: plant.weight,
    image: plant.image || ''
  }
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref(load().map(withCatalog))
  const open = ref(false)

  watch(lines, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

  const count = computed(() => lines.value.reduce((s, l) => s + l.qty, 0))
  const total = computed(() => lines.value.reduce((s, l) => s + l.price * l.qty, 0))

  function add(plant, qty = 1) {
    const found = lines.value.find((l) => l.id === plant.id)
    if (found) found.qty += qty
    else {
      lines.value.push(withCatalog({
        id: plant.id,
        name: plant.name,
        price: plant.price,
        weight: plant.weight,
        image: plant.image || '',
        qty
      }))
    }
  }

  function setQty(id, qty) {
    const line = lines.value.find((l) => l.id === id)
    if (!line) return
    line.qty = Math.max(1, qty)
  }

  function remove(id) {
    lines.value = lines.value.filter((l) => l.id !== id)
  }

  function clear() {
    lines.value = []
  }

  function toggle(force) {
    open.value = force ?? !open.value
  }

  return { lines, open, count, total, add, setQty, remove, clear, toggle }
})
