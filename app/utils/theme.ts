// Light / dark theme helpers shared by plugins/vuetify.ts and composables/useThemeMode.ts.
// The chosen theme is saved in localStorage; first-time visitors get their OS preference.
// The theme name is mirrored on <html data-theme="…"> so main.css can swap the --sk-* tokens.

export type ShopThemeName = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'shopkart-theme'

export function getInitialTheme(): ShopThemeName {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage blocked (private mode): fall back to the OS preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeAttribute(name: string) {
  document.documentElement.dataset.theme = name
}

export function saveTheme(name: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name)
  } catch {
    // Not saved; the toggle still works for this visit
  }
}
