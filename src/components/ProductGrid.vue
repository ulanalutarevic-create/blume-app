<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  items: { type: Array, required: true }
})
const emit = defineEmits(['open', 'add'])
</script>

<template>
  <ul class="product-kit-grid">
    <li v-for="(plant, i) in items" :key="plant.id" :style="{ '--i': i }">
      <ProductCard
        :plant="plant"
        @open="emit('open', $event)"
        @add="(plant, qty) => emit('add', plant, qty)"
      />
    </li>
  </ul>
  <p v-if="!items.length" class="data-empty brand" style="margin-top: 1rem">ничего не найдено</p>
</template>
