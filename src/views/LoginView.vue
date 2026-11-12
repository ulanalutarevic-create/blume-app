<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CrtHero from '../components/CrtHero.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('admin@mtp.by')
const password = ref('admin')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const fallback = auth.isAdmin ? '/data' : '/cabinet'
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : fallback)
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CrtHero>
    <form class="win95-window" @submit.prevent="submit">
      <div class="win95-title">
        <span>Вход</span>
        <router-link class="win95-close" to="/" aria-label="закрыть">×</router-link>
      </div>
      <div class="win95-body">
        <label class="win95-row">
          <span>Почта</span>
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label class="win95-row">
          <span>Пароль</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="error" class="win95-error">{{ error }}</p>
        <div class="win95-actions">
          <button class="win95-btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Ok' }}</button>
          <router-link class="win95-btn" to="/">Cancel</router-link>
        </div>
        <div class="win95-links">
          <router-link to="/register">регистрация</router-link>
          <router-link to="/forgot">забыли пароль?</router-link>
        </div>
      </div>
    </form>
  </CrtHero>
</template>
