<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'
import DataModal from '../components/DataModal.vue'
import BackupPanel from '../components/BackupPanel.vue'

const items = ref([])
const total = ref(0)
const page = ref(1)
const limit = 10
const loading = ref(false)
const modal = ref({ show: false, item: null })
const error = ref('')
const query = ref('')
const removingId = ref(null)
const flashId = ref(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((row) =>
    [row.name, row.weight, row.city, String(row.price)].some((v) =>
      String(v).toLowerCase().includes(q)
    )
  )
})

async function load(reset = false) {
  if (reset) {
    page.value = 1
    items.value = []
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/plants', { params: { page: page.value, limit } })
    if (reset) items.value = data.items
    else items.value = [...items.value, ...data.items]
    total.value = data.total
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось загрузить'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  modal.value = { show: true, item: null }
}

function openEdit(row) {
  modal.value = { show: true, item: { ...row } }
}

async function save(form) {
  try {
    let saved
    if (modal.value.item?.id) {
      const { data } = await api.put(`/plants/${modal.value.item.id}`, form)
      saved = data
    } else {
      const { data } = await api.post('/plants', form)
      saved = data
    }
    modal.value.show = false
    await load(true)
    flashId.value = saved?.id || null
    setTimeout(() => {
      flashId.value = null
    }, 1200)
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка сохранения'
  }
}

async function remove(row) {
  if (!confirm(`Удалить «${row.name}»?`)) return
  removingId.value = row.id
  try {
    await api.delete(`/plants/${row.id}`)
    await load(true)
  } finally {
    removingId.value = null
  }
}

function loadMore() {
  page.value += 1
  load(false)
}

onMounted(() => load(true))
</script>

<template>
  <div class="data-page">
    <header class="data-head">
      <div>
        <h1 class="brand data-title">Данные</h1>
      </div>
    </header>

    <BackupPanel class="data-backup" @restored="load(true)" />

    <div class="data-toolbar">
      <label class="data-search">
        <span class="data-search__icon" aria-hidden="true">⌕</span>
        <input
          v-model="query"
          type="search"
          placeholder="поиск по названию, городу, цене…"
          autocomplete="off"
        />
      </label>
      <button type="button" class="pill pill--dark data-add" @click="openCreate">
        + добавить
      </button>
    </div>
    <p v-if="query && filtered.length !== items.length" class="data-search-hint">
      найдено {{ filtered.length }} из загруженных
    </p>

    <p v-if="error" class="data-error">{{ error }}</p>

    <div v-if="!filtered.length && !loading" class="data-empty">
      <p class="brand">пока пусто</p>
      <p>добавь растение или загрузи эксель</p>
      <button type="button" class="pill pill--dark" @click="openCreate">добавить первое</button>
    </div>

    <ul v-else class="data-grid" aria-label="список растений">
      <li
        v-for="(row, i) in filtered"
        :key="row.id"
        class="plant-card"
        :class="{
          'is-removing': removingId === row.id,
          'is-flash': flashId === row.id
        }"
        :style="{ '--i': i }"
      >
        <div class="plant-card__top">
          <h3 class="plant-card__name">{{ row.name }}</h3>
          <span class="plant-card__city">{{ row.city }}</span>
        </div>

        <div class="plant-card__meta">
          <span class="pill pill--outline meta-pill">▾ {{ row.weight }}</span>
          <span class="pill pill--dark meta-pill">{{ row.price }} р.</span>
        </div>

        <div class="plant-card__actions">
          <button type="button" class="pill pill--light" @click="openEdit(row)">изменить</button>
          <button type="button" class="pill pill--outline plant-card__del" @click="remove(row)">
            удалить
          </button>
        </div>
      </li>
    </ul>

    <div class="data-foot">
      <button
        v-if="items.length < total"
        type="button"
        class="pill pill--outline data-more"
        :disabled="loading"
        @click="loadMore"
      >
        {{ loading ? 'загрузка…' : `подгрузить ещё · ещё ${total - items.length}` }}
      </button>
      <p v-if="loading && !items.length" class="data-foot__done">загрузка…</p>
    </div>

    <DataModal
      :show="modal.show"
      :item="modal.item"
      @close="modal.show = false"
      @save="save"
    />
  </div>
</template>
