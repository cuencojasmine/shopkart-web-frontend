import { useTheme } from 'vuetify'

// Light / dark toggle with a circular reveal that grows from the clicked button.
// plugins/vuetify.ts saves the choice and updates <html data-theme>.
//
// Why not Vuetify's built-in theme transition: it starts slowly (ease-in-out), can capture
// the new view before Nuxt has written Vuetify's theme CSS (colors then pop in mid-reveal),
// and lets every element's own color transition run underneath the reveal.

const REVEAL_DURATION = 450
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)' // fast start, soft landing
const STYLESHEET_ID = 'vuetify-theme-stylesheet'

let switching = false

export function useThemeMode() {
  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)

  // Switch the theme and resolve once Vuetify's theme CSS is in the page.
  // Nuxt's head manager writes it on a setTimeout after Vue's update, so poll briefly.
  async function applyTheme(name: string) {
    const readSheet = () => document.getElementById(STYLESHEET_ID)?.textContent
    const before = readSheet()
    theme.change(name)
    await nextTick()
    for (let i = 0; i < 30 && readSheet() === before; i++) await wait(5)
  }

  async function toggleTheme(event?: MouseEvent) {
    if (switching) return
    switching = true

    const next = isDark.value ? 'light' : 'dark'
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Turns off per-element color transitions while the theme changes (see main.css)
    root.classList.add('sk-theme-switching')

    try {
      // Hidden tabs never render, so a view transition would wait there indefinitely
      if (!document.startViewTransition || reduceMotion || document.hidden) {
        await applyTheme(next)
        return
      }

      const { x, y } = getOrigin(event)
      // Exactly reaches the farthest corner, so no part of the animation is spent off-screen
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      const transition = document.startViewTransition(() => applyTheme(next))

      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: REVEAL_DURATION, easing: REVEAL_EASING, pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {}) // skipped transition: the theme is still applied, just without the reveal

      // If the browser stalls the transition (e.g. the tab is hidden mid-switch),
      // skip it and switch directly so the toggle never gets stuck.
      await Promise.race([transition.finished, wait(REVEAL_DURATION + 1000)])
      if (theme.global.name.value !== next) {
        transition.skipTransition()
        await applyTheme(next)
      }
    } catch {
      // A skipped or failed transition still leaves the new theme applied
    } finally {
      getComputedStyle(root).opacity // commit the new colors before transitions come back
      root.classList.remove('sk-theme-switching')
      switching = false
    }
  }

  return { isDark, toggleTheme }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Click position, or the button's center for keyboard activation (clientX/Y are 0).
function getOrigin(event?: MouseEvent) {
  if (event && (event.clientX || event.clientY)) return { x: event.clientX, y: event.clientY }
  const target = event?.currentTarget as Element | null | undefined
  if (target) {
    const box = target.getBoundingClientRect()
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  }
  return { x: window.innerWidth / 2, y: 0 }
}
