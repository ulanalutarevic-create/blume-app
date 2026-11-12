<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Ошибка' },
  message: { type: String, default: '' },
  formats: { type: Array, default: () => [] }
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.45)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content card-verdura">
        <div class="modal-header border-0">
          <h5 class="modal-title brand">{{ title }}</h5>
          <button type="button" class="close" @click="emit('close')"><span>&times;</span></button>
        </div>
        <div class="modal-body">
          <p class="mb-2">{{ message }}</p>
          <ul v-if="formats.length" class="mb-0">
            <li v-for="f in formats" :key="f"><code>{{ f }}</code></li>
          </ul>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-verdura" @click="emit('close')">понятно</button>
        </div>
      </div>
    </div>
  </div>
</template>
