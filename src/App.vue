<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import CartDrawer from './components/CartDrawer.vue'
import ToastStack from './components/ToastStack.vue'

const route = useRoute()
const isLanding = computed(() => route.name === 'landing')
const isAuth = computed(() => ['login', 'register', 'forgot'].includes(route.name))
const isHero = computed(() => isLanding.value || isAuth.value)
const plainBgRoutes = new Set(['data', 'shop', 'cabinet'])
const isPlainBg = computed(() => plainBgRoutes.has(route.name))
const hideCart = computed(() => isAuth.value)
</script>

<template>
  <div
    class="app-shell"
    :class="{
      'app-shell--plain': isPlainBg,
      'app-shell--landing': isHero
    }"
  >
    <img
      v-if="!isPlainBg && !isHero"
      class="hero__bg"
      src="/images/grass-hero.jpg"
      alt=""
    />
    <div v-if="!isPlainBg && !isHero" class="app-shell__overlay" aria-hidden="true" />
    <div class="app-shell__content">
      <AppNavbar v-if="!isHero" />
      <main class="app-main" :class="{ container: !isHero }">
        <router-view />
      </main>
    </div>
    <CartDrawer v-if="!hideCart" />
    <ToastStack />
  </div>
</template>
