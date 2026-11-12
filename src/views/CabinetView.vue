<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { plants } from '../data/plants'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'
import { useToastStore } from '../stores/toast'

const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const toast = useToastStore()
const router = useRouter()

const fileInput = ref(null)
const avatarSrc = ref('')

const wishPlants = computed(() =>
  plants.filter((p) => wishlist.ids.includes(p.id))
)

const profile = computed(() => {
  const name = auth.user?.name || 'гость'
  const role = auth.isAdmin ? 'администратор blume*' : 'покупатель blume*'
  return {
    name,
    role,
    bio: auth.isAdmin
      ? 'слежу за каталогом, заказами и данными магазина. сад для каждого — в порядке.'
      : 'собираю растения под свой свет и настроение. избранное и корзина — всегда под рукой.',
    letter: name.trim().charAt(0).toLowerCase() || 'б'
  }
})

function avatarKey() {
  const id = auth.user?.id || auth.user?.email || 'guest'
  return `blume_avatar_${id}`
}

function loadAvatar() {
  try {
    avatarSrc.value = localStorage.getItem(avatarKey()) || ''
  } catch {
    avatarSrc.value = ''
  }
}

watch(() => auth.user?.id || auth.user?.email, loadAvatar, { immediate: true })

function openAvatarPicker() {
  fileInput.value?.click()
}

function onAvatarFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.push('выберите изображение', 'err')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.push('файл больше 2 МБ', 'err')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = String(reader.result || '')
    avatarSrc.value = dataUrl
    try {
      localStorage.setItem(avatarKey(), dataUrl)
    } catch {
      toast.push('не удалось сохранить аватар', 'err')
      return
    }
    toast.push('аватар обновлён', 'ok')
  }
  reader.onerror = () => toast.push('ошибка чтения файла', 'err')
  reader.readAsDataURL(file)
}

function clearAvatar() {
  avatarSrc.value = ''
  try {
    localStorage.removeItem(avatarKey())
  } catch {
    /* ignore */
  }
  toast.push('аватар сброшен', 'ok')
}

function goShop() {
  router.push('/shop')
}

function openCart() {
  cart.toggle(true)
}

function removeWish(id) {
  wishlist.toggle(id)
}

</script>

<template>
  <section class="page cabinet-page">
    <header class="data-head cabinet-head">
      <div>
        <h1 class="brand data-title">Личный кабинет</h1>
        <p class="shop-lede">профиль · корзина · избранное</p>
      </div>
    </header>

    <div class="cabinet-grid">
      <article class="cabinet-card tw-profile-card" aria-label="Карточка пользователя">
        <h2 class="cabinet-card__title w-full text-left">Профиль</h2>
        <div class="tw-profile-body">
          <input
            ref="fileInput"
            type="file"
            class="sr-only"
            accept="image/*"
            aria-hidden="true"
            tabindex="-1"
            @change="onAvatarFile"
          />
          <button
            type="button"
            class="tw-profile-avatar"
            :aria-label="avatarSrc ? 'Сменить аватар' : 'Установить аватар'"
            @click="openAvatarPicker"
          >
            <img
              v-if="avatarSrc"
              class="tw-profile-avatar__img"
              :src="avatarSrc"
              alt=""
            />
            <template v-else>{{ profile.letter }}</template>
          </button>
          <div class="tw-profile-meta">
            <strong class="font-fat text-lg font-extrabold tracking-tight text-brown">
              {{ profile.name }}
            </strong>
            <span class="text-sm font-bold lowercase text-brown-soft">{{ profile.role }}</span>
            <p class="cabinet-empty mt-1 text-sm leading-relaxed">{{ profile.bio }}</p>
          </div>
        </div>
        <div v-if="avatarSrc" class="cabinet-actions">
          <button type="button" class="pill pill--dark" @click="clearAvatar">
            убрать аватар
          </button>
        </div>
      </article>

      <article class="cabinet-card">
        <h2 class="cabinet-card__title">Корзина</h2>
        <p class="cabinet-stat">
          {{ cart.count }} поз. · <strong>{{ cart.total }} р.</strong>
        </p>
        <ul v-if="cart.lines.length" class="cabinet-list cabinet-list--soft">
          <li v-for="line in cart.lines" :key="line.id">
            <span>{{ line.name }}</span>
            <strong>×{{ line.qty }}</strong>
          </li>
        </ul>
        <p v-else class="cabinet-empty">пока пусто</p>
        <div class="cabinet-actions">
          <button type="button" class="pill pill--dark" @click="openCart">открыть корзину</button>
          <button type="button" class="pill pill--outline" @click="goShop">в каталог</button>
        </div>
      </article>

      <article class="cabinet-card cabinet-card--wide">
        <h2 class="cabinet-card__title">Избранное</h2>
        <ul v-if="wishPlants.length" class="cabinet-wish">
          <li v-for="plant in wishPlants" :key="plant.id">
            <div>
              <strong>{{ plant.name }}</strong>
              <p>{{ plant.city }} · {{ plant.price }} р.</p>
            </div>
            <button type="button" class="pill pill--outline" @click="removeWish(plant.id)">убрать</button>
          </li>
        </ul>
        <p v-else class="cabinet-empty">добавь растения из каталога</p>
      </article>
    </div>
  </section>
</template>
