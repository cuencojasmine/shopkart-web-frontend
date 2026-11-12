<!-- Soft glow that follows the cursor across a card, ported from Vue Bits
     (vue-bits.dev/components/spotlight-card). Renders as `tag` so it can be the card root.
     No overflow:hidden, so children (e.g. Click Spark) can draw past the edge; the glow
     follows the card's own border-radius instead. -->
<template>
  <component
    :is="tag"
    ref="rootRef"
    class="spotlight-card"
    @mousemove="handleMouseMove"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
  >
    <div
      class="spotlight"
      aria-hidden="true"
      :style="{
        opacity: visible ? strength : 0,
        background: `radial-gradient(circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`,
      }"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
const {
  tag = 'div',
  spotlightColor = 'rgba(110, 158, 204, 0.22)',
  strength = 0.6,
} = defineProps<{
  tag?: string
  spotlightColor?: string
  strength?: number
}>()

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const visible = ref(false)
const x = ref(0)
const y = ref(0)

function handleMouseMove(event: MouseEvent) {
  const el = rootRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  x.value = event.clientX - rect.left
  y.value = event.clientY - rect.top
}
</script>

<style scoped>
.spotlight-card {
  position: relative;
}

.spotlight {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  pointer-events: none;
  transition: opacity 0.5s ease-in-out;
}
</style>
