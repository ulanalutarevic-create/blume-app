<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QuizPlant from '../components/QuizPlant.vue'
import '../landing.css'

const router = useRouter()
const crtOn = ref(false)
const paintColors = [
  '#000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#fff', '#c0c0c0', '#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f',
  '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
]

function toggleCrt() {
  crtOn.value = !crtOn.value
}

const benefits = [
  {
    num: '01',
    title: 'быстрая доставка',
    text: 'защитная упаковка и доставка по городу за 24 часа',
    pin: '/images/pushpin.png',
    tint: '#fff8e8',
    left: 4,
    top: 6,
    tilt: -5,
    dark: true
  },
  {
    num: '02',
    title: 'живые и здоровые',
    text: 'проверка семян и ростков перед отправкой',
    pin: '/images/pushpin-purple.png',
    tint: '#fff1f4',
    left: 52,
    top: 2,
    tilt: 4
  },
  {
    num: '03',
    title: 'подбор под свет',
    text: 'рекомендации под ваш интерьер и опыт ухода',
    pin: '/images/pushpin-blue.png',
    tint: '#eef6ff',
    left: 8,
    top: 48,
    tilt: 3
  },
  {
    num: '04',
    title: 'гид по уходу',
    text: 'памятка и поддержка после покупки',
    pin: '/images/pushpin-pink.png',
    tint: '#f3eefc',
    left: 50,
    top: 46,
    tilt: -4,
    dark: true
  }
]

const reviews = [
  {
    letter: 'а',
    name: 'анна к.',
    text: '«тюльпаны взошли за неделю. упаковка — как открытка.»',
    city: 'минск',
    pin: '/images/pushpin-purple.png',
    tint: '#fff8e8',
    left: 4,
    top: 8,
    tiltDeg: -4
  },
  {
    letter: 'и',
    name: 'игорь м.',
    text: '«помогли выбрать набор для тёмной комнаты. через месяц — новые листья.»',
    city: 'гродно',
    pin: '/images/pushpin-blue.png',
    tint: '#eef6ff',
    left: 36,
    top: 36,
    tiltDeg: 3
  },
  {
    letter: 'м',
    name: 'мария л.',
    text: '«спокойный дизайн и честные фото. набор blume* — лучший подарок.»',
    city: 'брест',
    pin: '/images/pushpin-pink.png',
    tint: '#fff1f4',
    left: 66,
    top: 10,
    tiltDeg: -2
  }
]

function onQuizPick() {
  router.push('/shop')
}

</script>

<template>
  <div class="landing-page">
    <header class="hero hero--crt" id="top">
      <div class="hero__dots" aria-hidden="true" />
      <div class="hero__desk" aria-label="Ярлыки">
        <router-link class="hero__desk-icon hero__desk-icon--user" to="/login">
          <img src="/images/win95-icons/user.png" alt="" />
          <span>вход</span>
        </router-link>
        <router-link class="hero__desk-icon hero__desk-icon--search" to="/shop">
          <img src="/images/win95-icons/search.png" alt="" />
          <span>каталог</span>
        </router-link>
      </div>
      <div class="hero__crt-wrap" :class="{ 'is-on': crtOn }">
        <div class="hero__screen hero__screen--paint" :aria-hidden="!crtOn">
          <div class="paint-win">
            <div class="paint-win__title" aria-hidden="true">
              <span class="paint-win__icon" />
              <span>untitled - Paint</span>
              <span class="paint-win__controls">
                <i class="paint-win__btn">_</i>
                <i class="paint-win__btn">□</i>
                <i class="paint-win__btn paint-win__btn--close">×</i>
              </span>
            </div>
            <div class="paint-win__menu" aria-hidden="true">
              <span>File</span><span>Edit</span><span>View</span><span>Image</span><span>Colors</span><span>Help</span>
            </div>
            <div class="paint-win__body">
              <div class="paint-win__tools" aria-hidden="true">
                <i v-for="n in 16" :key="n" class="paint-win__tool" :data-t="n" />
                <div class="paint-win__tool-opts" />
              </div>
              <div class="paint-win__main">
                <div class="hero__brand" id="hero-brand">
                  <h1 class="logo-mark">blume<span>*</span></h1>
                  <div class="paint-canvas" aria-hidden="true">
                    <svg class="paint-canvas__art" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
                      <!-- doodles -->
                      <path d="M22 24 l3.8 9.5 10.2.2-8.1 6.4 2.9 10-8.8-5.8-8.6 6.1 2.6-10.1-8.2-6.2 10.2-.1z" fill="none" stroke="#e11d8f" stroke-width="1.7" stroke-linejoin="round"/>
                      <path d="M278 18 l3.2 8.2 8.8.1-7 5.5 2.5 8.7-7.5-5-7.4 5.2 2.2-8.8-7.1-5.4 8.9 0z" fill="none" stroke="#e11d8f" stroke-width="1.55" stroke-linejoin="round"/>
                      <path d="M298 86 l2.6 6.6 7.1 0-5.7 4.4 2.1 7-6.1-4-6.2 4.1 2-7.1-5.6-4.3 7.1.1z" fill="none" stroke="#e11d8f" stroke-width="1.45" stroke-linejoin="round"/>
                      <circle cx="48" cy="138" r="17" fill="none" stroke="#f5c518" stroke-width="2.3"/>
                      <circle cx="42" cy="133" r="1.7" fill="#f5c518"/>
                      <circle cx="55" cy="132" r="1.7" fill="#f5c518"/>
                      <path d="M39 142 q9 10 18-1" fill="none" stroke="#f5c518" stroke-width="2.1" stroke-linecap="round"/>
                      <path d="M72 44 q7-9 14 1" fill="none" stroke="#3ec6e0" stroke-width="1.6" stroke-linecap="round"/>
                      <path d="M246 128 q6-8 12 2" fill="none" stroke="#3ec6e0" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M236 36 l7 1.5-4.5 5.5" fill="none" stroke="#3ec6e0" stroke-width="1.4" stroke-linecap="round"/>
                      <path d="M288 132 c1-7 9-10 13-4 5-6 13-2 12 5-1 9-12 16-12 16s-14-7-13-17z" fill="#e22" stroke="#b00" stroke-width="1.15"/>
                      <!-- кистевая надпись как в Paint -->
                      <defs>
                        <filter id="paint-rough" x="-8%" y="-8%" width="116%" height="116%">
                          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
                          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.35"/>
                        </filter>
                      </defs>
                      <text
                        x="158"
                        y="86"
                        text-anchor="middle"
                        fill="none"
                        stroke="#111"
                        stroke-width="1.15"
                        font-family="Comic Sans MS, Segoe Print, cursive"
                        font-size="46"
                        font-weight="700"
                        transform="rotate(-1.5 158 86)"
                        opacity="0.28"
                        filter="url(#paint-rough)"
                      >blume*</text>
                      <text
                        x="156"
                        y="88"
                        text-anchor="middle"
                        fill="#151515"
                        font-family="Comic Sans MS, Segoe Print, cursive"
                        font-size="42"
                        font-weight="700"
                        transform="rotate(-2.2 156 88)"
                        filter="url(#paint-rough)"
                      >blume*</text>
                      <text
                        x="160"
                        y="128"
                        text-anchor="middle"
                        fill="#222"
                        font-family="Comic Sans MS, Segoe Print, cursive"
                        font-size="16"
                        font-weight="700"
                        transform="rotate(-2 160 128)"
                        filter="url(#paint-rough)"
                      >сад для каждого</text>
                    </svg>
                  </div>
                  <p class="hero__tagline">сад для каждого</p>
                </div>
                <div class="paint-win__palette" aria-hidden="true">
                  <span class="paint-win__fgbg"><i /><i /></span>
                  <span
                    v-for="(c, i) in paintColors"
                    :key="i"
                    class="paint-win__swatch"
                    :style="{ background: c }"
                  />
                </div>
              </div>
            </div>
            <div class="paint-win__status" aria-hidden="true">For Help, click Help Topics on the Help Menu.</div>
          </div>
        </div>
        <img class="hero__crt" src="/images/crt-monitor.png?v=6" alt="" aria-hidden="true" />
        <button
          type="button"
          class="hero__power"
          :class="{ 'is-on': crtOn }"
          :aria-pressed="crtOn"
          :aria-label="crtOn ? 'Выключить монитор' : 'Включить монитор'"
          @click="toggleCrt"
        />
        <span class="hero__power-led" :class="{ 'is-on': crtOn }" aria-hidden="true" />
        <span class="hero__sticker hero__sticker--a" aria-hidden="true">✿</span>
        <span class="hero__sticker hero__sticker--b" aria-hidden="true">★</span>
        <span class="hero__sticker hero__sticker--c" aria-hidden="true">♥</span>
        <img
          class="hero__pixel hero__pixel--kirby"
          src="/images/win95-icons/kirby-star.png"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero__pixel hero__pixel--mario"
          src="/images/win95-icons/mario-star.png"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero__pixel hero__pixel--kenny"
          src="/images/win95-icons/kenny.png"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero__pixel hero__pixel--domo"
          src="/images/win95-icons/domo.png"
          alt=""
          aria-hidden="true"
        />
      </div>
    </header>

    <div class="ticker" role="note">
      <div class="ticker__track">
        <p v-for="n in 6" :key="n" :aria-hidden="n > 1 ? 'true' : undefined">
          нет двора — не значит нет сада! пусть растения blume<span>*</span>
        </p>
      </div>
    </div>

    <main>
      <section class="quiz-section section" id="quiz">
        <div class="container">
          <header class="section-head">
            <h2>Какое растение тебе?</h2>
          </header>
        </div>
        <QuizPlant :benefits="benefits" :reviews="reviews" @pick="onQuizPick" />
      </section>
    </main>

    <footer class="footer" id="contacts">
      <div class="container footer__grid">
        <div>
          <p class="logo-mark logo-mark--sm">blume<span>*</span></p>
          <p>интернет-магазин растений. сад для каждого.</p>
        </div>
        <div>
          <h3>контакты</h3>
          <ul>
            <li><a href="mailto:hello@blume.shop">hello@blume.shop</a></li>
            <li><a href="tel:+375291234567">+375 (29) 123-45-67</a></li>
            <li>минск, ул. зелёная, 12</li>
          </ul>
        </div>
        <div>
          <h3>навигация</h3>
          <ul>
            <li><a href="#quiz">квиз</a></li>
            <li><a href="#quiz">почему blume*</a></li>
            <li><a href="#quiz">отзывы</a></li>
            <li><router-link to="/register">кабинет (регистрация)</router-link></li>
            <li><router-link to="/shop">каталог Vue</router-link></li>
          </ul>
        </div>
        <div>
          <h3>соцсети</h3>
          <ul>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">инстаграм</a></li>
            <li><a href="https://t.me" target="_blank" rel="noopener noreferrer">телеграм</a></li>
            <li><a href="https://vk.com" target="_blank" rel="noopener noreferrer">вконтакте</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer__bottom">
        <p>© 2026 blume*. учебный проект упвеб.</p>
      </div>
    </footer>
  </div>
</template>
