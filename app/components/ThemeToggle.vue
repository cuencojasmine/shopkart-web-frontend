<!-- Sun / moon button that switches between the light and dark themes. -->
<template>
  <v-btn
    icon
    variant="text"
    size="small"
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <!-- :key restarts the spin-in animation each time the icon swaps -->
    <v-icon :key="isDark ? 'sun' : 'moon'" :icon="isDark ? 'sun' : 'moon'" size="22" class="theme-icon" />
    <v-tooltip activator="parent" location="bottom">{{ isDark ? 'Light theme' : 'Dark theme' }}</v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useThemeMode()
</script>

<style scoped>
.theme-toggle {
  color: var(--sk-ink-soft);
}

.theme-icon {
  animation: theme-icon-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes theme-icon-in {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
}
</style>
