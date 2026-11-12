<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { plants } from '../data/plants'
import FiltersBar from '../components/FiltersBar.vue'
import ProductGrid from '../components/ProductGrid.vue'
import AdSlot from '../components/AdSlot.vue'
import ProductModal from '../components/ProductModal.vue'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'

const cart = useCartStore()
const toast = useToastStore()
const route = useRoute()
const router = useRouter()

const filters = ref({
  q: '',
  city: '',
  light: '',
  maxPrice: 0
})

const selected = ref(null)
const modalOpen = ref(false)

const filtered = computed(() => {
  const q = filters.value.q.trim().toLowerCase()
  return plants.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (filters.value.city && p.city !== filters.value.city) return false
    if (filters.value.light && p.light !== filters.value.light) return false
    if (filters.value.maxPrice > 0 && p.price > filters.value.maxPrice) return false
    return true
  })
})

function openPlant(plant) {
  selected.value = plant
  modalOpen.value = true
}

function addPlant(plant, qty = 1) {
  cart.add(plant, qty)
  toast.push(qty > 1 ? `добавлено ×${qty}` : 'добавлено в корзину', 'ok')
}

function closeModal() {
  modalOpen.value = false
  if (route.query.focus) {
    router.replace({ name: 'shop', query: {} })
  }
}

watch(
  () => route.query.focus,
  (id) => {
    if (!id) return
    const plant = plants.find((p) => String(p.id) === String(id))
    if (plant) openPlant(plant)
  },
  { immediate: true }
)
</script>

<template>
  <section class="page shop-page">
    <header class="data-head shop-head">
      <div>
        <p class="data-eyebrow">catalog</p>
        <h1 class="brand data-title">Растения</h1>
        <p class="shop-lede">фильтры · модалка · корзина · избранное — всё на фронтенде</p>
      </div>
    </header>

    <FiltersBar v-model="filters" />

    <AdSlot size="banner" label="Рекламное место" />

    <ProductGrid
      :items="filtered"
      @open="openPlant"
      @add="addPlant"
    />

    <ProductModal
      :show="modalOpen"
      :plant="selected"
      @close="closeModal"
      @add="addPlant"
    />
  </section>
</template>
