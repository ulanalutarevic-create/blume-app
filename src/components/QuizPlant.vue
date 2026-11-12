<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { plants } from '../data/plants'

const emit = defineEmits(['pick'])

const props = defineProps({
  benefits: { type: Array, default: () => [] },
  reviews: { type: Array, default: () => [] }
})

const step = ref(0)
const answers = ref({ light: '', budget: '', vibe: '' })
const boardEl = ref(null)
const draggingId = ref(null)
const dragMoved = ref(false)

const pinColors = [
  '/images/pushpin.png',
  '/images/pushpin-purple.png',
  '/images/pushpin-blue.png',
  '/images/pushpin-pink.png'
]

const noteTints = ['#fff8e8', '#fff1f4', '#eef6ff', '#f3eefc', '#fff9e0']

const navNotes = [
  {
    id: 'nav-benefits',
    label: 'почему blume*',
    href: 'quiz',
    pin: '/images/pushpin-pink.png',
    tint: '#fff1f4',
    left: 70,
    top: 22,
    tilt: 6
  },
  {
    id: 'nav-reviews',
    label: 'отзывы',
    href: 'quiz',
    pin: '/images/pushpin-blue.png',
    tint: '#eef6ff',
    left: 66,
    top: 58,
    tilt: -5
  }
]

const questions = [
  {
    key: 'light',
    title: 'сколько света у тебя дома?',
    options: [
      { value: 'яркий', label: 'много солнца' },
      { value: 'средний', label: 'рассеянный свет' },
      { value: 'тень', label: 'почти тень' }
    ]
  },
  {
    key: 'budget',
    title: 'какой бюджет?',
    options: [
      { value: 'low', label: 'до 90 р.' },
      { value: 'mid', label: '90–130 р.' },
      { value: 'high', label: 'от 130 р.' }
    ]
  },
  {
    key: 'vibe',
    title: 'что важнее?',
    options: [
      { value: 'новичкам', label: 'просто ухаживать' },
      { value: 'воздух', label: 'чистый воздух' },
      { value: 'декор', label: 'красивый вид' },
      { value: 'крупное', label: 'крупное растение' }
    ]
  }
]

const chaosLayouts = [
  [
    { left: 4, top: 8, tilt: -8 },
    { left: 52, top: 0, tilt: 6 },
    { left: 28, top: 48, tilt: -3 }
  ],
  [
    { left: 8, top: 4, tilt: 5 },
    { left: 48, top: 36, tilt: -7 },
    { left: 18, top: 52, tilt: 3 }
  ],
  [
    { left: 2, top: 2, tilt: -5 },
    { left: 50, top: 8, tilt: 8 },
    { left: 10, top: 46, tilt: 4 },
    { left: 46, top: 50, tilt: -6 }
  ]
]

const resultChaos = [
  { left: 6, top: 10, tilt: -4 },
  { left: 48, top: 42, tilt: 5 }
]

const notePos = reactive({})

function stickyId(kind, index) {
  return `${kind}-${index}`
}

function isStickyId(id) {
  return id.startsWith('benefit-') || id.startsWith('review-') || id.startsWith('nav-')
}

function seedStickyNotes() {
  props.benefits.forEach((b, i) => {
    const id = stickyId('benefit', i)
    if (!notePos[id]) notePos[id] = { left: b.left, top: b.top, tilt: b.tilt ?? 0 }
  })
  props.reviews.forEach((r, i) => {
    const id = stickyId('review', i)
    if (!notePos[id]) notePos[id] = { left: r.left, top: r.top, tilt: r.tiltDeg ?? 0 }
  })
  navNotes.forEach((n) => {
    if (!notePos[n.id]) notePos[n.id] = { left: n.left, top: n.top, tilt: n.tilt }
  })
}

function resetPositions() {
  const sticky = {}
  Object.keys(notePos).forEach((k) => {
    if (isStickyId(k)) sticky[k] = { ...notePos[k] }
    delete notePos[k]
  })
  Object.assign(notePos, sticky)
  seedStickyNotes()
  notePos.title = { left: 4, top: 2, tilt: step.value < questions.length ? -2 : 1.5 }
  const layout = chaosLayouts[step.value] || chaosLayouts[0]
  const q = questions[step.value]
  if (q) {
    q.options.forEach((opt, i) => {
      const spot = layout[i % layout.length]
      notePos[`opt-${opt.value}`] = { left: spot.left, top: spot.top, tilt: spot.tilt }
    })
  } else {
    notePos['act-pick'] = { ...resultChaos[0] }
    notePos['act-restart'] = { ...resultChaos[1] }
  }
}

function goSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(step, resetPositions, { immediate: true })
watch(() => [props.benefits, props.reviews], seedStickyNotes, { immediate: true })
onMounted(seedStickyNotes)

const currentOptions = computed(() => {
  const q = questions[step.value]
  if (!q) return []
  return q.options.map((opt, i) => ({
    ...opt,
    id: `opt-${opt.value}`,
    pin: pinColors[(i + 1) % pinColors.length],
    tint: noteTints[(i + 1) % noteTints.length]
  }))
})

const result = computed(() => {
  if (step.value < questions.length) return null
  const scored = plants.map((p) => {
    let score = 0
    if (p.light === answers.value.light) score += 3
    if (answers.value.budget === 'low' && p.price <= 90) score += 2
    if (answers.value.budget === 'mid' && p.price > 90 && p.price <= 130) score += 2
    if (answers.value.budget === 'high' && p.price > 130) score += 2
    if (p.tag === answers.value.vibe) score += 3
    return { plant: p, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.plant || plants[0]
})

let pointerId = null
let startX = 0
let startY = 0
let originLeft = 0
let originTop = 0
let boardRect = null
let activeId = null
let activeAction = null

function onPointerDown(e, id, action = null) {
  if (e.button != null && e.button !== 0) return
  const board = boardEl.value
  if (!board) return
  const pos = notePos[id]
  if (!pos) return

  e.preventDefault()
  activeId = id
  activeAction = action
  draggingId.value = id
  dragMoved.value = false
  pointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  originLeft = pos.left
  originTop = pos.top
  boardRect = board.getBoundingClientRect()

  e.currentTarget.setPointerCapture?.(e.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(e) {
  if (pointerId != null && e.pointerId !== pointerId) return
  if (!activeId || !boardRect) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!dragMoved.value && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    dragMoved.value = true
  }
  if (!dragMoved.value) return

  const left = originLeft + (dx / boardRect.width) * 100
  const top = originTop + (dy / boardRect.height) * 100
  notePos[activeId].left = Math.min(88, Math.max(-2, left))
  notePos[activeId].top = Math.min(85, Math.max(-2, top))
}

function onPointerUp(e) {
  if (pointerId != null && e.pointerId !== pointerId) return
  const wasDrag = dragMoved.value
  const action = activeAction
  const id = activeId

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)

  draggingId.value = null
  pointerId = null
  activeId = null
  activeAction = null
  boardRect = null

  if (!wasDrag && action) action()
  dragMoved.value = false
}

function choose(value) {
  const q = questions[step.value]
  answers.value[q.key] = value
  step.value += 1
}

function restart() {
  step.value = 0
  answers.value = { light: '', budget: '', vibe: '' }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<template>
  <div ref="boardEl" class="quiz quiz--board" aria-label="квиз на пробковой доске">
    <img class="quiz__board-bg" src="/images/corkboard.jpg?v=3" alt="" aria-hidden="true" />

    <div class="quiz__board-content">
      <article
        v-for="(b, i) in benefits"
        :key="stickyId('benefit', i)"
        class="pin-note"
        :class="{ 'pin-note--dark': b.dark, 'is-dragging': draggingId === stickyId('benefit', i) }"
        :style="{
          '--tilt': `${notePos[stickyId('benefit', i)]?.tilt ?? b.tilt}deg`,
          left: `${notePos[stickyId('benefit', i)]?.left ?? b.left}%`,
          top: `${notePos[stickyId('benefit', i)]?.top ?? b.top}%`,
          background: b.dark ? undefined : b.tint
        }"
        @pointerdown="onPointerDown($event, stickyId('benefit', i))"
      >
        <img class="pin-note__pin" :src="b.pin" alt="" aria-hidden="true" />
        <span class="pin-note__num">{{ b.num }}</span>
        <h3>{{ b.title }}</h3>
        <p>{{ b.text }}</p>
      </article>

      <article
        v-for="(r, i) in reviews"
        :key="stickyId('review', i)"
        class="pin-note pin-note--review"
        :class="{ 'is-dragging': draggingId === stickyId('review', i) }"
        :style="{
          '--tilt': `${notePos[stickyId('review', i)]?.tilt ?? r.tiltDeg}deg`,
          left: `${notePos[stickyId('review', i)]?.left ?? r.left}%`,
          top: `${notePos[stickyId('review', i)]?.top ?? r.top}%`,
          background: r.tint
        }"
        @pointerdown="onPointerDown($event, stickyId('review', i))"
      >
        <img class="pin-note__pin" :src="r.pin" alt="" aria-hidden="true" />
        <div class="pin-note__top">
          <span class="pin-note__avatar">{{ r.letter }}</span>
          <div>
            <h3>{{ r.name }}</h3>
            <p class="stars">★★★★★</p>
          </div>
        </div>
        <p class="pin-note__text">{{ r.text }}</p>
        <span class="pin-note__city">{{ r.city }}</span>
      </article>

      <template v-if="step < questions.length">
        <article
          class="quiz-note quiz-note--title"
          :class="{ 'is-dragging': draggingId === 'title' }"
          :style="{
            '--tilt': `${notePos.title?.tilt ?? -2}deg`,
            left: `${notePos.title?.left ?? 4}%`,
            top: `${notePos.title?.top ?? 2}%`
          }"
          @pointerdown="onPointerDown($event, 'title')"
        >
          <img class="quiz-note__pin" src="/images/pushpin.png" alt="" aria-hidden="true" />
          <p class="quiz__step">шаг {{ step + 1 }} / {{ questions.length }}</p>
          <h2 class="quiz__title">{{ questions[step].title }}</h2>
        </article>

        <div class="quiz__options quiz__options--chaos">
          <button
            v-for="opt in currentOptions"
            :key="opt.value"
            type="button"
            class="quiz-note quiz-note--opt"
            :class="{ 'is-dragging': draggingId === opt.id }"
            :style="{
              '--tilt': `${notePos[opt.id]?.tilt ?? 0}deg`,
              left: `${notePos[opt.id]?.left ?? 0}%`,
              top: `${notePos[opt.id]?.top ?? 0}%`,
              background: opt.tint
            }"
            @pointerdown="onPointerDown($event, opt.id, () => choose(opt.value))"
          >
            <img class="quiz-note__pin" :src="opt.pin" alt="" aria-hidden="true" />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="result">
        <article
          class="quiz-note quiz-note--title quiz-note--result"
          :class="{ 'is-dragging': draggingId === 'title' }"
          :style="{
            '--tilt': `${notePos.title?.tilt ?? 1.5}deg`,
            left: `${notePos.title?.left ?? 4}%`,
            top: `${notePos.title?.top ?? 2}%`
          }"
          @pointerdown="onPointerDown($event, 'title')"
        >
          <img class="quiz-note__pin" src="/images/pushpin-purple.png" alt="" aria-hidden="true" />
          <p class="quiz__step">твой match</p>
          <h2 class="quiz__title">{{ result.name }}</h2>
          <p class="quiz__result">
            {{ result.city }} · {{ result.weight }} · {{ result.price }} р. · свет: {{ result.light }}
          </p>
        </article>

        <div class="quiz__options quiz__options--chaos quiz__options--result">
          <button
            type="button"
            class="quiz-note quiz-note--opt quiz-note--action"
            :class="{ 'is-dragging': draggingId === 'act-pick' }"
            :style="{
              '--tilt': `${notePos['act-pick']?.tilt ?? -4}deg`,
              left: `${notePos['act-pick']?.left ?? 6}%`,
              top: `${notePos['act-pick']?.top ?? 10}%`
            }"
            @pointerdown="onPointerDown($event, 'act-pick', () => emit('pick', result))"
          >
            <img class="quiz-note__pin" src="/images/pushpin-pink.png" alt="" aria-hidden="true" />
            <span>в каталог к нему</span>
          </button>
          <button
            type="button"
            class="quiz-note quiz-note--opt"
            :class="{ 'is-dragging': draggingId === 'act-restart' }"
            :style="{
              '--tilt': `${notePos['act-restart']?.tilt ?? 5}deg`,
              left: `${notePos['act-restart']?.left ?? 48}%`,
              top: `${notePos['act-restart']?.top ?? 42}%`,
              background: noteTints[2]
            }"
            @pointerdown="onPointerDown($event, 'act-restart', restart)"
          >
            <img class="quiz-note__pin" src="/images/pushpin-blue.png" alt="" aria-hidden="true" />
            <span>пройти ещё раз</span>
          </button>
        </div>
      </template>

      <button
        v-for="n in navNotes"
        :key="n.id"
        type="button"
        class="quiz-note quiz-note--opt quiz-note--nav"
        :class="{ 'is-dragging': draggingId === n.id }"
        :style="{
          '--tilt': `${notePos[n.id]?.tilt ?? n.tilt}deg`,
          left: `${notePos[n.id]?.left ?? n.left}%`,
          top: `${notePos[n.id]?.top ?? n.top}%`,
          background: n.tint
        }"
        @pointerdown="onPointerDown($event, n.id, () => goSection(n.href))"
      >
        <img class="quiz-note__pin" :src="n.pin" alt="" aria-hidden="true" />
        <span>{{ n.label }}</span>
      </button>
    </div>
  </div>
</template>
