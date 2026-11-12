<!-- Infinite horizontal marquee, ported from Vue Bits (vue-bits.dev/animations/logo-loop).
     Trimmed to the horizontal mode with a scoped #item slot, so it can loop any content
     (here: category chips). Eases to a stop on hover/focus and stays still for reduced motion. -->
<template>
  <div
    ref="containerRef"
    class="logo-loop"
    :class="{ 'is-static': reduced }"
    role="region"
    :aria-label="ariaLabel"
    :style="{ '--loop-gap': `${gap}px`, '--loop-fade': fadeColor }"
  >
    <template v-if="fadeOut">
      <div class="loop-fade loop-fade-left" aria-hidden="true" />
      <div class="loop-fade loop-fade-right" aria-hidden="true" />
    </template>

    <div
      ref="trackRef"
      class="loop-track"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      @focusin="hovered = true"
      @focusout="hovered = false"
    >
      <ul
        v-for="copy in copyCount"
        :key="copy"
        :ref="(el) => { if (copy === 1) seqRef = el as HTMLUListElement | null }"
        class="loop-seq"
        :aria-hidden="copy > 1 ? 'true' : undefined"
        :inert="copy > 1 ? true : undefined"
      >
        <li v-for="(item, index) in items" :key="index" class="loop-item">
          <slot name="item" :item="item" :index="index" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
const props = withDefaults(defineProps<{
  items: T[]
  speed?: number // px per second; negative scrolls the other way
  gap?: number
  hoverSpeed?: number // speed while hovered; 0 pauses
  fadeOut?: boolean
  fadeColor?: string
  ariaLabel?: string
}>(), {
  speed: 60,
  gap: 12,
  hoverSpeed: 0,
  fadeOut: true,
  fadeColor: 'var(--sk-bg)',
  ariaLabel: 'Scrolling list',
})

defineSlots<{ item(props: { item: T, index: number }): unknown }>()

const SMOOTH_TAU = 0.25
const MIN_COPIES = 2
const COPY_HEADROOM = 2

const containerRef = ref<HTMLDivElement | null>(null)
const trackRef = ref<HTMLDivElement | null>(null)
const seqRef = ref<HTMLUListElement | null>(null)
const copyCount = ref(MIN_COPIES)
const hovered = ref(false)
// Reduced motion: no loop, just one copy in a normal swipeable row.
const reduced = ref(false)

let seqWidth = 0
let offset = 0
let velocity = 0
let lastTime: number | null = null
let frame: number | null = null
let resizeObserver: ResizeObserver | null = null

async function measure() {
  await nextTick()
  const containerWidth = containerRef.value?.clientWidth ?? 0
  const width = seqRef.value?.getBoundingClientRect().width ?? 0
  if (reduced.value) {
    copyCount.value = 1
  } else if (width > 0) {
    seqWidth = Math.ceil(width)
    copyCount.value = Math.max(MIN_COPIES, Math.ceil(containerWidth / width) + COPY_HEADROOM)
  }
}

function animate(timestamp: number) {
  const track = trackRef.value
  if (!track) return

  if (lastTime === null) lastTime = timestamp
  const dt = Math.max(0, timestamp - lastTime) / 1000
  lastTime = timestamp

  const target = hovered.value ? props.hoverSpeed : props.speed
  velocity += (target - velocity) * (1 - Math.exp(-dt / SMOOTH_TAU))

  if (seqWidth > 0) {
    offset = (((offset + velocity * dt) % seqWidth) + seqWidth) % seqWidth
    track.style.transform = `translate3d(${-offset}px, 0, 0)`
  }

  frame = requestAnimationFrame(animate)
}

onMounted(async () => {
  reduced.value = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  await measure()
  if (reduced.value) return

  resizeObserver = new ResizeObserver(() => measure())
  if (containerRef.value) resizeObserver.observe(containerRef.value)
  if (seqRef.value) resizeObserver.observe(seqRef.value)
  frame = requestAnimationFrame(animate)
})

watch(() => props.items, measure, { deep: true })

onUnmounted(() => {
  if (frame !== null) cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.logo-loop {
  position: relative;
  overflow-x: hidden;
  width: 100%;
}

.logo-loop.is-static {
  overflow-x: auto;
  scrollbar-width: none;
}

.logo-loop.is-static .loop-fade {
  display: none;
}

.loop-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: clamp(24px, 8%, 120px);
  pointer-events: none;
}

.loop-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--loop-fade) 0%, transparent 100%);
}

.loop-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--loop-fade) 0%, transparent 100%);
}

.loop-track {
  display: flex;
  width: max-content;
  will-change: transform;
  user-select: none;
}

.loop-seq {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.loop-item {
  flex: none;
  margin-right: var(--loop-gap);
}
</style>
