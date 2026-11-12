<!-- Burst of spark lines where the user clicks, ported from Vue Bits
     (vue-bits.dev/animations/click-spark).
     Changes from the original: the canvas overhangs the wrapped element by `overflow` px so
     sparks can fly past a small button, it is sharp on high-DPI screens, the animation loop
     only runs while sparks are on screen, and nothing fires when `disabled` or reduced motion. -->
<template>
  <div class="click-spark" @click="handleClick">
    <canvas ref="canvasRef" class="spark-canvas" :style="canvasStyle" aria-hidden="true" />
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

const props = withDefaults(defineProps<{
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number // ms
  overflow?: number // px the canvas extends past the wrapped element
  disabled?: boolean
}>(), {
  sparkColor: '#4d79a8',
  sparkSize: 12,
  sparkRadius: 26,
  sparkCount: 10,
  duration: 450,
  overflow: 48,
  disabled: false,
})

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

// A canvas is a replaced element, so `inset` alone won't stretch it; size it explicitly.
const canvasStyle = computed(() => ({
  top: `-${props.overflow}px`,
  left: `-${props.overflow}px`,
  width: `calc(100% + ${props.overflow * 2}px)`,
  height: `calc(100% + ${props.overflow * 2}px)`,
}))
let sparks: Spark[] = []
let frame: number | null = null

const easeOut = (t: number) => t * (2 - t)

function fitCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const { width, height } = canvas.getBoundingClientRect()
  const w = Math.round(width * dpr)
  const h = Math.round(height * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  return dpr
}

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const canvas = canvasRef.value
  if (!canvas) return

  fitCanvas()
  const rect = canvas.getBoundingClientRect()
  // Keyboard "clicks" have no pointer position; burst from the centre instead.
  const fromKeyboard = event.detail === 0
  const x = fromKeyboard ? rect.width / 2 : event.clientX - rect.left
  const y = fromKeyboard ? rect.height / 2 : event.clientY - rect.top
  const now = performance.now()

  for (let i = 0; i < props.sparkCount; i++) {
    sparks.push({ x, y, angle: (2 * Math.PI * i) / props.sparkCount, startTime: now })
  }

  if (frame === null) frame = requestAnimationFrame(draw)
}

function draw(timestamp: number) {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) {
    frame = null
    return
  }

  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  ctx.strokeStyle = props.sparkColor
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  sparks = sparks.filter((spark) => {
    const elapsed = timestamp - spark.startTime
    if (elapsed >= props.duration) return false

    const eased = easeOut(Math.max(0, elapsed) / props.duration)
    const distance = eased * props.sparkRadius
    const length = props.sparkSize * (1 - eased)
    const cos = Math.cos(spark.angle)
    const sin = Math.sin(spark.angle)

    ctx.beginPath()
    ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin)
    ctx.lineTo(spark.x + (distance + length) * cos, spark.y + (distance + length) * sin)
    ctx.stroke()
    return true
  })

  frame = sparks.length ? requestAnimationFrame(draw) : null
}

onUnmounted(() => {
  if (frame !== null) cancelAnimationFrame(frame)
})
</script>

<style scoped>
.click-spark {
  position: relative;
}

.spark-canvas {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}
</style>
