<script setup>
import { useWishlistStore } from '../stores/wishlist'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  plantId: { type: String, required: true }
})

const wishlist = useWishlistStore()
const toast = useToastStore()

function onClick() {
  const on = wishlist.has(props.plantId)
  wishlist.toggle(props.plantId)
  toast.push(on ? 'убрано из избранного' : 'в избранном', 'ok')
}
</script>

<template>
  <button
    type="button"
    class="pill pill--outline wish-btn"
    :class="{ 'is-on': wishlist.has(plantId) }"
    @click.stop="onClick"
  >
    {{ wishlist.has(plantId) ? '♥ в избранном' : '♡ избранное' }}
  </button>
</template>
