<!-- Bottom-right toast stack fed by useNotify(). Mounted once in app.vue so
     the storefront layout and the products page (layout: false) share it. -->
<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in notify.toasts.value"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        :style="{ '--toast-duration': `${notify.duration}ms` }"
        @mouseenter="notify.pause(toast.id)"
        @mouseleave="notify.resume(toast.id)"
        @focusin="notify.pause(toast.id)"
        @focusout="notify.resume(toast.id)"
      >
        <div class="toast-icon">
          <v-icon :icon="META[toast.type].icon" size="20" />
        </div>

        <div class="toast-message">{{ toast.message }}</div>

        <button type="button" class="toast-close" aria-label="Dismiss notification" @click="notify.dismiss(toast.id)">
          <v-icon icon="x" size="18" />
        </button>

        <span :key="toast.run" class="toast-timer" aria-hidden="true" />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useNotify'

const notify = useNotify()

const META: Record<ToastType, { icon: string }> = {
  info: { icon: 'info' },
  success: { icon: 'circle-check' },
  warning: { icon: 'triangle-alert' },
  error: { icon: 'circle-alert' },
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2600; /* above drawers and dialogs */
  width: min(420px, calc(100vw - 32px));
  pointer-events: none;
}

.toast-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== Card ===== */
.toast {
  --tone: #0ea5e9;
  --tint: rgba(14, 165, 233, 0.16);

  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 12px 14px 14px;
  overflow: hidden;
  pointer-events: auto;
  background:
    radial-gradient(70% 140% at 0% 30%, var(--tint) 0%, transparent 70%),
    var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 16px;
  box-shadow: var(--sk-shadow-sm), 0 12px 32px -12px var(--sk-shadow-soft);
}

.toast--info { --tone: #0ea5e9; --tint: rgba(14, 165, 233, 0.2); }
.toast--success { --tone: #22c55e; --tint: rgba(34, 197, 94, 0.2); }
.toast--warning { --tone: #f59e0b; --tint: rgba(245, 158, 11, 0.24); }
.toast--error { --tone: #ef4444; --tint: rgba(239, 68, 68, 0.18); }

.toast-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 40px;
  height: 40px;
  color: var(--tone);
  background: var(--sk-surface);
  border-radius: 11px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 4px 12px -4px rgba(15, 23, 42, 0.12);
  animation: toast-icon-pop 0.5s 0.12s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.toast-message {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--sk-ink);
  overflow-wrap: anywhere;
}

.toast-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--sk-placeholder);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 8px;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.2s ease;
}

.toast-close:hover {
  color: var(--sk-ink);
  background: var(--sk-hover);
  transform: rotate(90deg);
}

.toast-close:focus-visible {
  outline: 2px solid var(--sk-brand-700);
  outline-offset: 1px;
}

/* Time-left bar: shrinks over the toast's lifetime, pauses on hover/focus */
.toast-timer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: var(--tone);
  opacity: 0.55;
  transform-origin: left center;
  animation: toast-timer var(--toast-duration) linear forwards;
}

.toast:hover .toast-timer,
.toast:focus-within .toast-timer {
  animation-play-state: paused;
}

/* ===== Enter / leave / reorder ===== */
.toast-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.5s cubic-bezier(0.22, 1.3, 0.36, 1);
}

.toast-leave-active {
  position: absolute; /* lets the rest of the stack slide into place */
  transition:
    opacity 0.25s ease,
    transform 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.94);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(48px) scale(0.96);
}

.toast-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes toast-icon-pop {
  from { opacity: 0; transform: scale(0.5) rotate(-12deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
}

@keyframes toast-timer {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

@media (max-width: 599px) {
  .toast-stack { right: 16px; bottom: 16px; }
  .toast-leave-to { transform: translateY(24px) scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move { transition: opacity 0.2s ease; }
  .toast-enter-from,
  .toast-leave-to { transform: none; }
  .toast-icon { animation: none; }
}
</style>
