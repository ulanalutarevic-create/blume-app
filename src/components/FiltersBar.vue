<script setup>
import { cities, lights } from '../data/plants'

const model = defineModel({ type: Object, required: true })

function reset() {
  model.value.q = ''
  model.value.city = ''
  model.value.light = ''
  model.value.maxPrice = 0
}
</script>

<template>
  <div class="filters-bar">
    <label class="filters-bar__field">
      <span>поиск</span>
      <input v-model="model.q" type="search" placeholder="название…" />
    </label>
    <label class="filters-bar__field">
      <span>город</span>
      <select v-model="model.city">
        <option value="">все</option>
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>
    <label class="filters-bar__field">
      <span>свет</span>
      <select v-model="model.light">
        <option value="">любой</option>
        <option v-for="l in lights" :key="l" :value="l">{{ l }}</option>
      </select>
    </label>
    <label class="filters-bar__field">
      <span>цена до</span>
      <input v-model.number="model.maxPrice" type="number" min="0" step="5" placeholder="200" />
    </label>
    <div class="filters-bar__field filters-bar__field--action">
      <span class="filters-bar__spacer" aria-hidden="true">&nbsp;</span>
      <button type="button" class="pill pill--outline filters-bar__reset" @click="reset">
        сбросить
      </button>
    </div>
  </div>
</template>
