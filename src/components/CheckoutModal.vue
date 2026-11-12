<script setup>
import { reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close', 'submit'])

const auth = useAuthStore()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  city: 'Минск',
  address: '',
  comment: ''
})

watch(
  () => props.show,
  (open) => {
    if (!open) return
    form.name = auth.user?.name || ''
    form.email = auth.user?.email || ''
    form.phone = ''
    form.city = 'Минск'
    form.address = ''
    form.comment = ''
  }
)

function submit() {
  emit('submit', { ...form })
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="data-modal checkout-modal"
    tabindex="-1"
    @click="onBackdrop"
    @keydown.esc="emit('close')"
  >
    <div class="data-modal__sheet" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header class="data-modal__head checkout-modal__head">
        <h2 id="checkout-title" class="brand">оформление</h2>
      </header>

      <form class="data-modal__form" @submit.prevent="submit">
        <label>
          <span>имя</span>
          <input v-model="form.name" type="text" autocomplete="name" required />
        </label>
        <label>
          <span>телефон</span>
          <input
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            placeholder="+375 (29) 000-00-00"
            required
          />
        </label>
        <label>
          <span>почта</span>
          <input v-model="form.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>город</span>
          <input v-model="form.city" type="text" autocomplete="address-level2" required />
        </label>
        <label>
          <span>адрес доставки</span>
          <input
            v-model="form.address"
            type="text"
            autocomplete="street-address"
            placeholder="улица, дом, квартира"
            required
          />
        </label>
        <label>
          <span>комментарий</span>
          <input v-model="form.comment" type="text" placeholder="необязательно" />
        </label>
        <div class="data-modal__actions checkout-modal__actions">
          <button type="button" class="pill pill--outline" @click="emit('close')">отмена</button>
          <button type="submit" class="pill pill--dark">подтвердить заказ</button>
        </div>
      </form>
    </div>
  </div>
</template>
