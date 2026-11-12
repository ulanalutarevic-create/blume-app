<script setup>
import { ref } from 'vue'

const props = defineProps({
  plant: { type: Object, required: true }
})
const emit = defineEmits(['open', 'add'])

const qty = ref(1)

function dec() {
  qty.value = Math.max(1, qty.value - 1)
}

function inc() {
  qty.value += 1
}

function add() {
  emit('add', props.plant, qty.value)
}
</script>

<template>
  <article class="product-kit">
    <button type="button" class="product-kit__media" @click="emit('open', plant)">
      <span class="packet-win95">
        <img class="packet-img" :src="plant.image" :alt="plant.name" />
        <img class="packet-win95__frame" src="/images/win95-frame.png?v=2" alt="" aria-hidden="true" />
      </span>
    </button>

    <button
      type="button"
      class="pill pill--outline meta-pill"
      @click="emit('open', plant)"
    >
      <span>▾</span>
      <span>{{ plant.weight }}</span>
      <span>{{ plant.price }} р.</span>
    </button>

    <div class="pill pill--dark cart-pill">
      <button class="qty" type="button" aria-label="меньше" @click="dec">−</button>
      <span class="qty-val">{{ qty }}</span>
      <button class="qty" type="button" aria-label="больше" @click="inc">+</button>
      <span class="cart-pill__sep" aria-hidden="true" />
      <button class="add" type="button" @click="add">в корзину</button>
    </div>
  </article>
</template>
