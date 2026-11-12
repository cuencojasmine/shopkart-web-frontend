// Toast notifications for the whole app (rendered once by components/ToastStack.vue in app.vue).
// notify.success('Saved') pushes a toast; it closes itself after DURATION ms,
// pauses while hovered, and the same message is never stacked twice.

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  // Bumped when the same message fires again, so the progress bar restarts.
  run: number
}

const DURATION = 4000
const MAX_VISIBLE = 4

// Timers only exist in the browser; toasts are always raised by user actions.
const timers = new Map<number, { handle: ReturnType<typeof setTimeout>, endsAt: number, remaining: number }>()
let nextId = 1

export function useNotify() {
  const toasts = useState<Toast[]>('shop-toasts', () => [])

  function dismiss(id: number) {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer.handle)
    timers.delete(id)
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function startTimer(id: number, ms: number) {
    const existing = timers.get(id)
    if (existing) clearTimeout(existing.handle)
    timers.set(id, { handle: setTimeout(() => dismiss(id), ms), endsAt: Date.now() + ms, remaining: ms })
  }

  function pause(id: number) {
    const timer = timers.get(id)
    if (!timer) return
    clearTimeout(timer.handle)
    timer.remaining = Math.max(0, timer.endsAt - Date.now())
  }

  function resume(id: number) {
    const timer = timers.get(id)
    if (timer) startTimer(id, timer.remaining)
  }

  function show(message: string, type: ToastType) {
    if (!import.meta.client) return

    const duplicate = toasts.value.find((toast) => toast.message === message && toast.type === type)
    if (duplicate) {
      duplicate.run++
      startTimer(duplicate.id, DURATION)
      return
    }

    const toast: Toast = { id: nextId++, type, message, run: 0 }
    toasts.value = [...toasts.value, toast]
    startTimer(toast.id, DURATION)

    // Drop the oldest when too many pile up.
    while (toasts.value.length > MAX_VISIBLE) dismiss(toasts.value[0]!.id)
  }

  return {
    toasts,
    duration: DURATION,
    dismiss,
    pause,
    resume,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    warning: (message: string) => show(message, 'warning'),
    info: (message: string) => show(message, 'info'),
  }
}
