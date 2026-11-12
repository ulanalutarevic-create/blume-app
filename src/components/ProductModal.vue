<script setup>
import WishlistButton from './WishlistButton.vue'

defineProps({
  show: Boolean,
  plant: { type: Object, default: null }
})
const emit = defineEmits(['close', 'add'])

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div v-if="show && plant" class="data-modal" @click="onBackdrop">
    <div class="data-modal__sheet product-modal">
      <header class="data-modal__head">
        <h2 class="brand">{{ plant.name }}</h2>
        <button type="button" class="pill pill--outline data-modal__x" @click="emit('close')">✕</button>
      </header>
      <p class="product-modal__meta">
        {{ plant.city }} · {{ plant.weight }} · свет: {{ plant.light }} · {{ plant.tag }}
      </p>
      <p class="product-modal__price">{{ plant.price }} р.</p>
      <p class="product-modal__text">
        Живое растение из каталога blume*. Подходит для дома, упакуем бережно и отправим по городу.
      </p>
      <div class="data-modal__actions">
        <WishlistButton :plant-id="plant.id" />
        <button type="button" class="pill pill--dark" @click="emit('add', plant)">в корзину</button>
      </div>
    </div>
  </div>
</template>
