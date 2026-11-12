<!-- Press-and-hold confirm button with a wavy fill, ported from Vue Bits
     (vue-bits.dev/micro/hold-button). Tailwind classes rewritten as scoped CSS and trimmed
     to the left-to-right fill. Emits `hold` once the fill completes; releasing early cancels.
     Works with mouse, touch, and keyboard (hold Space or Enter, Esc cancels). -->
<template>
  <button
    ref="buttonRef"
    type="button"
    class="hold-btn"
    :class="[`hb-${size}`, { 'hb-block': block }]"
    :disabled="disabled"
    :data-phase="phase"
    :data-input="input ?? undefined"
    :data-glow="glow ? 'true' : undefined"
    :aria-describedby="hintId"
    :style="cssVars"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="endPointer($event)"
    @pointercancel="endPointer($event, { drifted: true })"
    @lostpointercapture="endPointer($event, { drifted: true })"
    @pointerleave="handlePointerLeave"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @contextmenu.prevent
  >
    <span class="hb-pulse" aria-hidden="true" />

    <span class="hb-label">
      <span class="hb-idle" :aria-hidden="phase === 'done'"><slot>Hold to delete</slot></span>
      <span class="hb-done" :aria-hidden="phase !== 'done'">{{ doneLabel }}</span>
    </span>

    <span class="hb-clip" aria-hidden="true">
      <span v-for="layer in ['hb-fill', 'hb-crest']" :key="layer" class="hb-layer" :class="layer">
        <span class="hb-label">
          <span class="hb-idle"><slot>Hold to delete</slot></span>
          <span class="hb-done">{{ doneLabel }}</span>
        </span>
      </span>
    </span>

    <span :id="hintId" class="hb-sr-only">
      Press and hold for {{ Math.round(holdTime / 100) / 10 }} seconds to confirm
    </span>
  </button>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

type Phase = 'idle' | 'holding' | 'done'
type Input = 'pointer' | 'key' | null

const props = withDefaults(defineProps<{
  doneLabel?: string
  backgroundColor?: string
  fillColor?: string
  textColor?: string
  fillTextColor?: string
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  radius?: number
  holdTime?: number // ms to hold
  releaseTime?: number // ms for the fill to drain after letting go
  pressScale?: number
  waveAmplitude?: number // 0 for a straight edge
  glow?: boolean
  resetAfter?: number // ms after completing before returning to idle; 0 stays done
  disabled?: boolean
}>(), {
  doneLabel: 'Deleted',
  backgroundColor: '#fdecec',
  fillColor: '#dc2626',
  textColor: '#b91c1c',
  fillTextColor: '#ffffff',
  size: 'md',
  block: false,
  radius: 12,
  holdTime: 1500,
  releaseTime: 200,
  pressScale: 0.97,
  waveAmplitude: 6,
  glow: true,
  resetAfter: 1200,
  disabled: false,
})

const emit = defineEmits<{ hold: [], tap: [] }>()

const TAP_MS = 250
const HIT_PAD = 10
const LINEAR = (t: number) => t
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3)

const phase = ref<Phase>('idle')
const input = ref<Input>(null)
let phaseNow: Phase = 'idle'
let inputNow: Input = null
const buttonRef = ref<HTMLButtonElement | null>(null)
const gesture = { pointerId: null as number | null, start: 0, rect: null as DOMRect | null }
const timers = { complete: 0, reset: 0 }
const hintId = useId()
let resizeObserver: ResizeObserver | null = null

function go(next: Phase, kind: Input = null) {
  phaseNow = next
  inputNow = kind
  phase.value = next
  input.value = kind
}

function clearTimers() {
  clearTimeout(timers.complete)
  clearTimeout(timers.reset)
}

// Drives --hb-p (0 → 1 fill progress) with requestAnimationFrame.
const motion = { raf: 0, p: 0, from: 0, to: 0, start: 0 }
function drive(to: number, duration: number, ease: (t: number) => number) {
  cancelAnimationFrame(motion.raf)
  motion.from = motion.p
  motion.to = to
  motion.start = performance.now()
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - motion.start) / duration) : 1
    motion.p = motion.from + (motion.to - motion.from) * ease(t)
    buttonRef.value?.style.setProperty('--hb-p', motion.p.toFixed(4))
    if (t < 1) {
      motion.raf = requestAnimationFrame(step)
      return
    }
    motion.raf = 0
    if (motion.to === 1) complete()
  }
  motion.raf = requestAnimationFrame(step)
}

function complete() {
  if (phaseNow !== 'holding') return
  if (performance.now() - gesture.start < props.holdTime - 50) return
  clearTimers()
  go('done', inputNow)
  emit('hold')
  if (props.resetAfter > 0) {
    timers.reset = window.setTimeout(() => {
      go('idle')
      drive(0, props.releaseTime, EASE_OUT)
    }, props.resetAfter)
  }
}

function begin(kind: Input) {
  if (props.disabled || phaseNow !== 'idle' || !buttonRef.value) return false
  gesture.start = performance.now()
  gesture.rect = buttonRef.value.getBoundingClientRect()
  go('holding', kind)
  drive(1, props.holdTime, LINEAR)
  // Backup in case rAF is throttled (background tab).
  timers.complete = window.setTimeout(complete, props.holdTime + 100)
  return true
}

function release({ drifted = false } = {}) {
  if (phaseNow !== 'holding') return
  clearTimers()
  const held = performance.now() - gesture.start
  go('idle')
  drive(0, props.releaseTime, EASE_OUT)
  if (!drifted && held < TAP_MS) emit('tap')
}

function handlePointerDown(e: PointerEvent) {
  if (e.button !== 0 || !e.isPrimary || gesture.pointerId !== null) return
  if (!begin('pointer')) return
  gesture.pointerId = e.pointerId
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    // pointer capture unavailable
  }
}

function endPointer(e: PointerEvent, options?: { drifted?: boolean }) {
  if (e.pointerId !== gesture.pointerId) return
  gesture.pointerId = null
  const el = e.currentTarget as HTMLElement
  try {
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  } catch {
    // already released
  }
  release(options)
}

function handlePointerMove(e: PointerEvent) {
  if (e.pointerId !== gesture.pointerId || !gesture.rect) return
  const r = gesture.rect
  const out =
    e.clientX < r.left - HIT_PAD || e.clientX > r.right + HIT_PAD ||
    e.clientY < r.top - HIT_PAD || e.clientY > r.bottom + HIT_PAD
  if (out) endPointer(e, { drifted: true })
}

function handlePointerLeave(e: PointerEvent) {
  if (e.pointerType !== 'touch') endPointer(e, { drifted: true })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (inputNow === 'key') {
      e.stopPropagation() // cancel the hold, not the surrounding dialog
      release({ drifted: true })
    }
    return
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    if (!e.repeat) begin('key')
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    if (inputNow === 'key') release()
  }
}

onMounted(() => {
  const button = buttonRef.value
  if (!button) return
  const measure = () => {
    button.style.setProperty('--hb-w', `${button.offsetWidth}px`)
    button.style.setProperty('--hb-h', `${button.offsetHeight}px`)
  }
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(button)
})

// Cancel a hold if the window loses focus mid-press.
watch(phase, (next, _prev, onCleanup) => {
  if (next !== 'holding') return
  const cancel = () => release({ drifted: true })
  const onVisibility = () => {
    if (document.hidden) cancel()
  }
  window.addEventListener('blur', cancel)
  document.addEventListener('visibilitychange', onVisibility)
  onCleanup(() => {
    window.removeEventListener('blur', cancel)
    document.removeEventListener('visibilitychange', onVisibility)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  clearTimers()
  cancelAnimationFrame(motion.raf)
})

const cssVars = computed(() => ({
  '--hb-radius': `${props.radius}px`,
  '--hb-bg': props.backgroundColor,
  '--hb-fill': props.fillColor,
  '--hb-text': props.textColor,
  '--hb-fill-text': props.fillTextColor,
  '--hb-hold': `${props.holdTime}ms`,
  '--hb-cycles': props.holdTime / 1100,
  '--hb-release': `${props.releaseTime}ms`,
  '--hb-press': props.pressScale,
  '--hb-wave': `${props.waveAmplitude}px`,
}) as CSSProperties)
</script>

<style scoped>
.hold-btn {
  --hb-w: 0px;
  --hb-h: 0px;
  --hb-p: 0;
  --hb-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --hb-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --hb-glow: 0 10px 32px -6px color-mix(in srgb, var(--hb-fill) 70%, transparent);

  position: relative;
  isolation: isolate;
  display: inline-grid;
  place-items: center;
  margin: 0;
  border: 0;
  border-radius: var(--hb-radius);
  outline: none;
  background: var(--hb-bg);
  color: var(--hb-text);
  font: inherit;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
  box-shadow: var(--hb-shadow);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 160ms var(--hb-ease-out),
    background-color 160ms ease,
    box-shadow var(--hb-release) var(--hb-ease-out);
}

.hb-sm { height: 36px; padding: 0 16px; font-size: 13px; }
.hb-md { height: 44px; padding: 0 22px; font-size: 15px; }
.hb-lg { height: 52px; padding: 0 28px; font-size: 17px; }

.hb-block {
  display: grid;
  width: 100%;
}

@media (hover: hover) and (pointer: fine) {
  .hold-btn:enabled:hover {
    background: color-mix(in srgb, var(--hb-bg) 92%, #000);
  }
}

.hold-btn:focus-visible {
  outline: 2px solid var(--hb-fill);
  outline-offset: 3px;
}

.hold-btn:disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.hold-btn[data-phase='holding'][data-input='pointer'] {
  transform: scale(var(--hb-press));
}

.hold-btn[data-glow='true'][data-phase='holding'] {
  box-shadow: var(--hb-shadow), var(--hb-glow);
  transition:
    transform 160ms var(--hb-ease-out),
    background-color 160ms ease,
    box-shadow var(--hb-hold) linear;
}

.hold-btn[data-glow='true'][data-phase='done'] {
  box-shadow: var(--hb-shadow), var(--hb-glow);
}

/* ---------- Labels: idle and done stacked in one grid cell, cross-faded ---------- */
.hb-label {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
}

.hb-idle,
.hb-done {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: opacity 200ms ease, filter 200ms ease;
}

.hb-done,
.hold-btn[data-phase='done'] .hb-idle {
  opacity: 0;
  filter: blur(2px);
}

.hold-btn[data-phase='done'] .hb-done {
  opacity: 1;
  filter: none;
}

/* ---------- Fill layers ---------- */
.hb-clip {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  clip-path: inset(0 round var(--hb-radius));
}

.hb-layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--hb-fill-text);
  background: var(--hb-fill);
}

.hb-fill {
  clip-path: inset(
    0 calc((1 - var(--hb-p)) * (100% + 0.75 * var(--hb-wave)) - var(--hb-p) * 0.25 * var(--hb-wave)) 0 0
  );
}

/* Wavy leading edge that rides just ahead of the flat fill */
.hb-crest {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");
  -webkit-mask-repeat: repeat-y;
  mask-repeat: repeat-y;
  -webkit-mask-size: var(--hb-wave) calc(var(--hb-h) * 2);
  mask-size: var(--hb-wave) calc(var(--hb-h) * 2);
  -webkit-mask-position-x: calc(-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave)));
  mask-position-x: calc(-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave)));
  -webkit-mask-position-y: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h));
  mask-position-y: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h));
}

/* ---------- Completion pulse ---------- */
.hb-pulse {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: var(--hb-radius);
  opacity: 0;
  pointer-events: none;
}

.hold-btn[data-glow='true'][data-phase='done'] .hb-pulse {
  animation: hb-pulse 600ms var(--hb-ease-out) forwards;
}

@keyframes hb-pulse {
  from {
    opacity: 1;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--hb-fill) 55%, transparent);
  }
  to {
    opacity: 0;
    box-shadow: 0 0 0 14px color-mix(in srgb, var(--hb-fill) 0%, transparent);
  }
}

.hb-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

/* Reduced motion: no wave, no scale, the fill fades in over the hold time instead */
@media (prefers-reduced-motion: reduce) {
  .hold-btn {
    transform: none !important;
    transition: background-color 160ms ease, box-shadow var(--hb-release) ease !important;
  }

  .hb-fill {
    clip-path: inset(0) !important;
    opacity: 0;
    transition: opacity var(--hb-release) ease !important;
  }

  .hb-crest {
    display: none;
  }

  .hold-btn[data-phase='holding'] .hb-fill,
  .hold-btn[data-phase='done'] .hb-fill {
    opacity: 1;
    transition: opacity var(--hb-hold) linear !important;
  }

  .hb-pulse {
    animation: none !important;
  }

  .hb-idle,
  .hb-done {
    filter: none !important;
  }
}
</style>
