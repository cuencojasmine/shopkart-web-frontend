<!-- Spring count-up number, ported from Vue Bits (vue-bits.dev/text-animations/count-up).
     Starts when scrolled into view. Unlike the original, a later change to `to`
     (e.g. products finishing loading) springs from the current value to the new one. -->
<template>
  <span ref="elementRef" class="count-up" />
</template>

<script setup lang="ts">
interface Props {
  to: number
  from?: number
  delay?: number // seconds
  duration?: number // seconds, roughly how long the spring takes to settle
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  from: 0,
  delay: 0,
  duration: 2,
  separator: ',',
})

const elementRef = useTemplateRef<HTMLSpanElement>('elementRef')

let current = props.from
let velocity = 0
let frame: number | null = null
let delayTimer: ReturnType<typeof setTimeout> | undefined
let inView = false
let observer: IntersectionObserver | null = null

const damping = computed(() => 20 + 40 * (1 / props.duration))
const stiffness = computed(() => 100 * (1 / props.duration))

function format(value: number) {
  const text = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value))
  return props.separator === ',' ? text : text.replace(/,/g, props.separator)
}

function render() {
  if (elementRef.value) elementRef.value.textContent = format(current)
}

function step() {
  const displacement = props.to - current
  velocity += (displacement * stiffness.value - velocity * damping.value) * 0.016
  current += velocity * 0.016
  render()

  if (Math.abs(displacement) > 0.01 || Math.abs(velocity) > 0.01) {
    frame = requestAnimationFrame(step)
  } else {
    current = props.to
    render()
    frame = null
  }
}

function start(withDelay: boolean) {
  if (frame !== null) return // already springing; it reads props.to every frame

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    current = props.to
    render()
    return
  }

  clearTimeout(delayTimer)
  delayTimer = setTimeout(() => {
    velocity = 0
    frame = requestAnimationFrame(step)
  }, withDelay ? props.delay * 1000 : 0)
}

watch(() => props.to, () => {
  if (inView) start(false)
})

onMounted(() => {
  render()
  if (!elementRef.value) return

  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !inView) {
      inView = true
      start(true)
      observer?.disconnect()
    }
  })
  observer.observe(elementRef.value)
})

onUnmounted(() => {
  if (frame !== null) cancelAnimationFrame(frame)
  clearTimeout(delayTimer)
  observer?.disconnect()
})
</script>

<style scoped>
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
