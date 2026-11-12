<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import CrtHero from '../components/CrtHero.vue'

const auth = useAuthStore()
const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  message.value = ''
  loading.value = true
  try {
    message.value = await auth.forgot(email.value)
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CrtHero>
    <form class="win95-window" @submit.prevent="submit">
      <div class="win95-title">
        <span>Пароль</span>
        <router-link class="win95-close" to="/login" aria-label="закрыть">×</router-link>
      </div>
      <div class="win95-body">
        <label class="win95-row">
          <span>Почта</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <p v-if="error" class="win95-error">{{ error }}</p>
        <p v-if="message" class="win95-ok">{{ message }}</p>
        <div class="win95-actions">
          <button class="win95-btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Ok' }}</button>
          <router-link class="win95-btn" to="/login">Cancel</router-link>
        </div>
      </div>
    </form>
  </CrtHero>
</template>
