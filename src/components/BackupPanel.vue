<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['restored'])

const auth = useAuthStore()
const status = ref(null)
const message = ref('')
const error = ref('')
const busy = ref('')

async function loadStatus() {
  if (!auth.isAdmin) return
  try {
    const { data } = await api.get('/backup/status')
    status.value = data
  } catch {
    /* ignore */
  }
}

async function run(action) {
  busy.value = action
  message.value = ''
  error.value = ''
  try {
    const path =
      action === 'email'
        ? '/backup/to-email'
        : action === 'gdrive'
          ? '/backup/to-gdrive'
          : '/backup/from-gdrive'
    const { data } = await api.post(path, action === 'email' ? { email: auth.user?.email } : {})
    message.value = data.message || 'готово'
    await loadStatus()
    if (action === 'restore') emit('restored', data)
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'ошибка'
  } finally {
    busy.value = ''
  }
}

onMounted(loadStatus)
</script>

<template>
  <section v-if="auth.isAdmin" class="backup-panel" aria-label="резервная копия">
    <header class="backup-panel__head">
      <h2 class="brand backup-panel__title">резервная копия</h2>
      <p class="backup-panel__hint">
        дамп базы → почта / Google Диск · восстановление с upsert (дубли обновляются)
      </p>
    </header>

    <div class="backup-panel__actions">
      <button
        type="button"
        class="pill pill--outline"
        :disabled="!!busy"
        @click="run('email')"
      >
        {{ busy === 'email' ? 'отправляю…' : 'на почту' }}
      </button>
      <button
        type="button"
        class="pill pill--dark"
        :disabled="!!busy"
        @click="run('gdrive')"
      >
        {{ busy === 'gdrive' ? 'заливаю…' : 'на Google Диск' }}
      </button>
      <button
        type="button"
        class="pill pill--light"
        :disabled="!!busy"
        @click="run('restore')"
      >
        {{ busy === 'restore' ? 'читаю…' : 'с Диска в базу' }}
      </button>
    </div>

    <p v-if="status?.latestDump" class="backup-panel__meta">
      на Диске:
      <strong>{{ status.latestDump.name }}</strong>
      · {{ status.latestDump.count }} зап. ·
      {{ new Date(status.latestDump.exportedAt).toLocaleString('ru-RU') }}
    </p>
    <p v-else class="backup-panel__meta">на Диске пока нет дампа · в базе {{ status?.plantsTotal ?? '…' }} записей</p>

    <p v-if="message" class="backup-panel__ok">{{ message }}</p>
    <p v-if="error" class="backup-panel__err">{{ error }}</p>
  </section>
</template>
