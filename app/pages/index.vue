<template>
  <v-container class="py-16 text-center">
    <v-icon icon="mdi-cart" color="primary" size="64" />
    <h1 class="text-h3 font-weight-bold mt-4">
      Shop<span class="text-primary">Kart</span>
    </h1>
    <p class="text-medium-emphasis mt-2 mb-6">Welcome to ShopKart</p>
    <v-btn to="/products" color="primary" prepend-icon="mdi-package-variant">
      Manage Products
    </v-btn>
  </v-container>
</template>

<script lang="ts" setup>
useHead({ title: 'ShopKart' })
</script>
