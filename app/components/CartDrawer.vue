<!-- Slide-in shopping cart with quantity controls and the "Checkout All" button. -->
<template>
  <v-navigation-drawer
    v-model="cart.drawerOpen.value"
    location="right"
    temporary
    :width="drawerWidth"
    class="sk-drawer"
  >
    <div class="d-flex flex-column fill-height">
      <div class="d-flex align-center pa-4">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="38" class="mr-3">
          <v-icon icon="shopping-bag" />
        </v-avatar>
        <span class="text-h6 font-weight-bold">My Cart</span>
        <v-chip size="small" color="primary" variant="tonal" class="ml-2">
          {{ cart.totalItems.value }} {{ cart.totalItems.value === 1 ? 'item' : 'items' }}
        </v-chip>
        <v-spacer />
        <v-btn icon="x" variant="text" aria-label="Close cart" @click="cart.drawerOpen.value = false" />
      </div>

      <v-divider />

      <!-- EMPTY CART -->
      <div v-if="!cart.items.value.length" class="flex-grow-1 d-flex flex-column align-center justify-center pa-8 text-center">
        <v-avatar color="primary" variant="tonal" size="96">
          <v-icon icon="shopping-cart" size="44" />
        </v-avatar>
        <h3 class="mt-4">Your cart is empty</h3>
        <p class="text-medium-emphasis mt-2">Add products from the shop to get started.</p>
        <v-btn color="primary" rounded="pill" class="mt-5" @click="cart.drawerOpen.value = false">Continue Shopping</v-btn>
      </div>

      <!-- CART ITEMS -->
      <div v-else class="flex-grow-1 overflow-y-auto pa-4">
        <CartItemRow v-for="item in cart.items.value" :key="item.documentId" :item="item" class="mb-3" />
      </div>

      <!-- TOTALS + CHECKOUT ALL -->
      <div v-if="cart.items.value.length" class="pa-4 cart-footer">
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span class="text-medium-emphasis">Total items</span>
          <span class="font-weight-bold">{{ cart.totalItems.value }}</span>
        </div>
        <div class="d-flex justify-space-between align-center mb-3">
          <span class="text-medium-emphasis">Total amount</span>
          <span class="text-h6 font-weight-bold text-primary">{{ formatCurrency(cart.totalAmount.value) }}</span>
        </div>

        <v-alert v-if="cart.hasProblems.value" type="warning" variant="tonal" density="compact" class="mb-3 text-body-2">
          Fix or remove the highlighted items before checking out.
        </v-alert>

        <v-btn
          block
          size="large"
          color="primary"
          rounded="pill"
          prepend-icon="credit-card"
          :disabled="cart.hasProblems.value"
          @click="goToCheckout"
        >
          Checkout All
        </v-btn>
        <v-btn block variant="text" class="mt-2" @click="cart.drawerOpen.value = false">
          Continue Shopping
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const cart = useCart()
const { xs } = useDisplay()

const drawerWidth = computed(() => (xs.value ? 340 : 420))

function goToCheckout() {
  cart.drawerOpen.value = false
  navigateTo('/checkout')
}
</script>

<style scoped>
.cart-footer {
  border-top: 1px solid var(--sk-border);
  background: var(--sk-drawer-footer);
}
</style>
