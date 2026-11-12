<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const open = ref(false)

function logout() {
  auth.logout()
  open.value = false
  router.push('/')
}

function toggle() {
  open.value = !open.value
}

function openCart() {
  open.value = false
  cart.toggle(true)
}
</script>

<template>
  <nav class="app-nav" aria-label="Навигация">
    <router-link
      class="logo-dock"
      to="/"
      aria-label="blume* — главная"
    >blume<span>*</span></router-link>

    <div v-if="auth.isAuth" class="app-nav__menu" :class="{ 'is-open': open }">
      <button
        type="button"
        class="nav-link app-nav__toggle"
        :aria-expanded="open"
        aria-haspopup="true"
        @click="toggle"
      >
        {{ open ? 'закрыть' : 'меню' }}
      </button>

      <div class="app-nav__panel">
        <button type="button" class="nav-link cart-nav-btn" @click="openCart">
          корзина
          <span v-if="cart.count" class="cart-nav-btn__badge">{{ cart.count }}</span>
        </button>
        <router-link class="nav-link" to="/shop" @click="open = false">каталог</router-link>
        <router-link class="nav-link" to="/cabinet" @click="open = false">личный кабинет</router-link>
        <template v-if="auth.isAdmin">
          <router-link class="nav-link" to="/upload" @click="open = false">загрузка</router-link>
          <router-link class="nav-link" to="/data" @click="open = false">данные</router-link>
        </template>
        <button type="button" class="nav-link" @click="logout">выход</button>
      </div>
    </div>
  </nav>
</template>
