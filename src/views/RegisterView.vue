<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CrtHero from '../components/CrtHero.vue'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    router.push(auth.isAdmin ? '/data' : '/cabinet')
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CrtHero>
    <form class="win95-window" @submit.prevent="submit">
      <div class="win95-title">
        <span>Регистрация</span>
        <router-link class="win95-close" to="/login" aria-label="закрыть">×</router-link>
      </div>
      <div class="win95-body">
        <label class="win95-row">
          <span>Имя</span>
          <input v-model="name" type="text" autocomplete="name" required />
        </label>
        <label class="win95-row">
          <span>Почта</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label class="win95-row">
          <span>Пароль</span>
          <input v-model="password" type="password" minlength="4" autocomplete="new-password" required />
        </label>
        <p v-if="error" class="win95-error">{{ error }}</p>
        <div class="win95-actions">
          <button class="win95-btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Ok' }}</button>
          <router-link class="win95-btn" to="/login">Cancel</router-link>
        </div>
        <div class="win95-links">
          <router-link to="/login">уже есть аккаунт</router-link>
        </div>
      </div>
    </form>
  </CrtHero>
</template>
