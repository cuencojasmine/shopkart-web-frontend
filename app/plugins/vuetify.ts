import 'vuetify/styles'
import { h } from 'vue'
import { createVuetify } from 'vuetify'
import type { IconSet } from 'vuetify'

// Renders plain icon strings ("shopping-bag") with the matching Lucide component.
const lucide: IconSet = {
  component: (props) => {
    const Icon = typeof props.icon === 'string' ? lucideIcons[props.icon] : undefined
    if (!Icon && import.meta.dev) {
      console.warn(`[icons] "${String(props.icon)}" is not registered in app/utils/icons.ts`)
    }
    return h(props.tag, null, Icon ? [h(Icon)] : [])
  },
}

// Holst palette: one blue scale from deep navy to near-white.
// The same values live in main.css as --sk-brand-* for custom styles.
const holst = {
  900: '#223A5E',
  800: '#355982',
  700: '#4D79A8',
  500: '#6E9ECC',
  300: '#9FC0E3',
  200: '#D0E1F2',
  50: '#F3F8FD',
}

// The brand scale is the same in both themes (bg-brand-200, color="brand-900", …).
// Status colors stay outside the blue scale so they are never mistaken for brand UI.
const brandColors = {
  'brand-900': holst[900],
  'brand-800': holst[800],
  'brand-700': holst[700],
  'brand-500': holst[500],
  'brand-300': holst[300],
  'brand-200': holst[200],
  'brand-50': holst[50],
}

export default defineNuxtPlugin((app) => {
  // ssr: false, so the saved theme is known before the first render (no light flash)
  const initialTheme = getInitialTheme()
  applyThemeAttribute(initialTheme)

  const vuetify = createVuetify({
    icons: {
      defaultSet: 'lucide',
      sets: { lucide },
      aliases: vuetifyLucideAliases,
    },
    theme: {
      // Saved choice, else the OS preference (see utils/theme.ts). ThemeToggle switches it.
      defaultTheme: initialTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            primary: holst[800], // buttons, links: 7.2:1 on white
            'primary-darken-1': holst[900], // hover / pressed
            secondary: holst[900], // app bar text, headings, dark surfaces
            accent: holst[700], // icons, focus rings, secondary actions: 4.6:1 on white
            background: holst[50],
            surface: '#FFFFFF',
            'surface-variant': holst[900], // tooltips, snackbars
            ...brandColors,
            success: '#15803D',
            warning: '#B45309',
            error: '#DC2626',
            info: holst[700],
          },
        },
        // Deep navy surfaces with a lighter blue primary; navy text on primary buttons.
        // The same surface values live in main.css under html[data-theme='dark'].
        dark: {
          dark: true,
          colors: {
            primary: '#7FAEDD', // 7.9:1 on the page background
            'on-primary': '#0B1422',
            'primary-darken-1': holst[300],
            secondary: holst[200],
            accent: holst[300],
            background: '#0B1422',
            surface: '#121D2E',
            'surface-bright': '#1A2840',
            'surface-variant': holst[200], // tooltips, snackbars
            'on-surface-variant': '#0B1422',
            ...brandColors,
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#F87171',
            info: '#7FAEDD',
          },
        },
      },
    },
    // Shared component defaults so every page gets the same clean look.
    defaults: {
      VBtn: { rounded: 'lg', class: 'text-none font-weight-bold', style: 'letter-spacing: 0' },
      VCard: { rounded: 'xl' },
      VChip: { rounded: 'lg' },
      VTextField: { rounded: 'lg' },
      VTextarea: { rounded: 'lg' },
      VSelect: { rounded: 'lg' },
      VAlert: { rounded: 'lg' },
    },
  })
  app.vueApp.use(vuetify)

  // Runs synchronously so the view-transition snapshot already has the new tokens.
  watch(vuetify.theme.global.name, (name) => {
    applyThemeAttribute(name)
    saveTheme(name)
  }, { flush: 'sync' })
})
