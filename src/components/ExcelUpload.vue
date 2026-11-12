<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import api from '../api/client'
import ErrorModal from './ErrorModal.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const dragover = ref(false)
const preview = ref([])
const status = ref('')
const loading = ref(false)
const error = ref({ show: false, message: '', formats: [] })
const inputRef = ref(null)

const ALLOWED = ['.xls', '.xlsx']

function checkExt(name) {
  const ext = '.' + (name.split('.').pop() || '').toLowerCase()
  return ALLOWED.includes(ext)
}

function parseLocal(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        resolve(XLSX.utils.sheet_to_json(sheet, { defval: '' }))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function handleFile(file) {
  if (!file) return
  if (!checkExt(file.name)) {
    error.value = {
      show: true,
      message: 'Неверный формат файла. Разрешены только таблицы Эксель:',
      formats: ALLOWED
    }
    return
  }

  try {
    preview.value = await parseLocal(file)
    localStorage.setItem(
      'blume_last_excel',
      JSON.stringify({ name: file.name, rows: preview.value, at: new Date().toISOString() })
    )
    status.value = `файл прочитан: «${file.name}» · ${preview.value.length} строк`

    if (!auth.isAuth) return

    loading.value = true
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/upload/excel', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    status.value = `сохранено: «${data.file.name}» · ${data.imported} строк (добавлено ${data.added ?? 0}, обновлено ${data.updated ?? 0})`
  } catch (e) {
    error.value = {
      show: true,
      message: e.response?.data?.message || e.message || 'Ошибка загрузки',
      formats: e.response?.data?.formats || []
    }
  } finally {
    loading.value = false
  }
}

function onDrop(e) {
  dragover.value = false
  const file = e.dataTransfer?.files?.[0]
  handleFile(file)
}

function onPick(e) {
  handleFile(e.target.files?.[0])
  e.target.value = ''
}
</script>

<template>
  <div>
    <div
      class="dropzone"
      :class="{ dragover, success: !!status }"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="onDrop"
      @click="inputRef?.click()"
    >
      <template v-if="status">
        <h4 class="brand mb-2">готово</h4>
        <p class="dropzone__status mb-0">{{ status }}</p>
        <p v-if="!auth.isAuth" class="text-muted small mt-2 mb-0">войдите, чтобы сохранить на сервер</p>
      </template>
      <template v-else>
        <h4 class="brand mb-2">загрузите эксель</h4>
        <p class="text-muted small mb-0">только файлы .xls / .xlsx</p>
      </template>
      <input ref="inputRef" type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="d-none" @change="onPick" />
    </div>

    <div v-if="!auth.isAuth" class="mt-3 dropzone-actions">
      <button class="btn btn-verdura btn-block w-100" type="button" @click="router.push('/login')">
        войти для сохранения на сервер
      </button>
    </div>

    <ErrorModal
      :show="error.show"
      title="ошибка файла"
      :message="error.message"
      :formats="error.formats"
      @close="error.show = false"
    />
  </div>
</template>
