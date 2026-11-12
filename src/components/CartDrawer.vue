<script setup>
import { ref } from 'vue'
import { plants } from '../data/plants'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import CheckoutModal from './CheckoutModal.vue'

const cart = useCartStore()
const toast = useToastStore()
const checkoutOpen = ref(false)

function lineImage(line) {
  if (line.image) return line.image
  return plants.find((p) => p.id === line.id)?.image || '/images/kit-mood.jpg'
}

function openCheckout() {
  if (!cart.count) return
  checkoutOpen.value = true
  cart.toggle(false)
}

function closeCheckout() {
  checkoutOpen.value = false
}

function submitOrder(form) {
  checkoutOpen.value = false
  cart.clear()
  toast.push(`заказ оформлен · ${form.name} · ${form.city}`, 'ok')
}

function openCart() {
  if (checkoutOpen.value) return
  cart.toggle(true)
}

function closeCart() {
  if (checkoutOpen.value) return
  cart.toggle(false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-show="!cart.open && !checkoutOpen"
      class="cart-edge-hotzone"
      aria-hidden="true"
      @mouseenter="openCart"
    />

    <div v-if="cart.open" class="cart-backdrop" @click="closeCart" />

    <aside
      class="cart-drawer"
      :class="{ 'is-open': cart.open }"
      aria-label="корзина"
      @mouseleave="closeCart"
    >
      <header class="cart-drawer__head">
        <h2 class="brand">Корзина</h2>
      </header>

      <div v-if="!cart.lines.length" class="cart-drawer__empty">пока пусто — загляни в каталог</div>

      <ul v-else class="cart-drawer__list">
        <li v-for="line in cart.lines" :key="line.id" class="cart-line">
          <img
            class="cart-line__img"
            :src="lineImage(line)"
            :alt="line.name"
            width="72"
            height="72"
            loading="lazy"
          />
          <div class="cart-line__body">
            <div class="cart-line__info">
              <strong>{{ line.name }}</strong>
              <p>{{ line.weight }} · {{ line.price }} р.</p>
            </div>
            <div class="cart-line__qty">
              <button type="button" class="pill pill--outline" @click="cart.setQty(line.id, line.qty - 1)">−</button>
              <span>{{ line.qty }}</span>
              <button type="button" class="pill pill--outline" @click="cart.setQty(line.id, line.qty + 1)">+</button>
              <button type="button" class="pill pill--light" @click="cart.remove(line.id)">удл.</button>
            </div>
          </div>
        </li>
      </ul>

      <footer v-if="cart.lines.length" class="cart-drawer__foot">
        <p>итого: <strong>{{ cart.total }} р.</strong></p>
        <button type="button" class="pill pill--dark w-100" @click="openCheckout">оформить</button>
      </footer>
    </aside>

    <CheckoutModal
      :show="checkoutOpen"
      @close="closeCheckout"
      @submit="submitOrder"
    />
  </Teleport>
</template>
