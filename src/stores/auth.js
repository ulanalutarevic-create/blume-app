import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('blume_user') || 'null'))
  const token = ref(localStorage.getItem('blume_token') || '')

  const isAuth = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function persist(nextToken, nextUser) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem('blume_token', nextToken)
    localStorage.setItem('blume_user', JSON.stringify(nextUser))
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data.token, data.user)
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    persist(data.token, data.user)
    return data.user
  }

  async function forgot(email) {
    const { data } = await api.post('/auth/forgot', { email })
    return data.message
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('blume_token')
    localStorage.removeItem('blume_user')
  }

  return { user, token, isAuth, isAdmin, login, register, forgot, logout }
})
