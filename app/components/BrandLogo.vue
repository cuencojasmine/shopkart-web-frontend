<!-- ShopKart wordmark used in the App Bar, footer, and Product Management header. -->
<template>
  <NuxtLink to="/" class="brand d-inline-flex align-center" :class="{ 'brand-small': small }" aria-label="ShopKart home">
    <span class="brand-mark">
      <img src="/logo.png" alt="" width="36" height="36" class="brand-img" />
    </span>
    <span class="brand-name">SHOP<span class="text-primary">KART</span></span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ small?: boolean }>()
</script>

<style scoped>
.brand {
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
  color: var(--sk-ink);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 6px 14px -6px rgba(var(--sk-brand-800-rgb), 0.7);
}

.brand-img {
  display: block;
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brand-small .brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.brand-small .brand-name {
  font-size: 18px;
}
</style>
