<!-- Slide-in wishlist: saved products with Add to Cart and Remove. -->
<template>
  <v-navigation-drawer
    v-model="wishlist.drawerOpen.value"
    location="right"
    temporary
    :width="xs ? 340 : 400"
    class="sk-drawer"
  >
    <div class="d-flex align-center pa-4">
      <v-avatar color="pink" variant="tonal" rounded="lg" size="38" class="mr-3">
        <v-icon icon="heart" class="sk-icon-fill" />
      </v-avatar>
      <span class="text-h6 font-weight-bold">My Wishlist</span>
      <v-chip size="small" color="pink" variant="tonal" class="ml-2">{{ wishlist.count.value }}</v-chip>
      <v-spacer />
      <v-btn icon="x" variant="text" aria-label="Close wishlist" @click="wishlist.drawerOpen.value = false" />
    </div>

    <v-divider />

    <div v-if="!wishlist.count.value" class="d-flex flex-column align-center justify-center pa-8 text-center mt-10">
      <v-avatar color="pink" variant="tonal" size="96">
        <v-icon icon="heart" size="44" />
      </v-avatar>
      <h3 class="mt-4">Your wishlist is empty</h3>
      <p class="text-medium-emphasis mt-2">Tap the heart on a product to save it here.</p>
    </div>

    <div v-else class="pa-4">
      <v-card
        v-for="product in wishlistProducts"
        :key="product.documentId"
        variant="flat"
        rounded="xl"
        class="mb-3 sk-surface"
      >
        <div class="d-flex pa-3 ga-3">
          <v-avatar rounded="lg" size="64" class="flex-shrink-0 sk-thumb">
            <v-img v-if="product.image" :src="getProductImageUrl(product.image, 'small')" :alt="product.name" class="sk-product-img" />
            <v-icon v-else icon="image-off" color="grey" />
          </v-avatar>

          <div class="flex-grow-1" style="min-width: 0">
            <div class="font-weight-bold text-truncate">{{ product.name }}</div>
            <div class="text-primary font-weight-bold">{{ formatCurrency(product.price) }}</div>
            <div class="text-caption" :class="Number(product.stock) > 0 ? 'text-medium-emphasis' : 'text-error'">
              {{ Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock' }}
            </div>

            <div class="d-flex ga-2 mt-2">
              <v-btn
                size="small"
                color="primary"
                variant="flat"
                prepend-icon="shopping-cart-plus"
                :disabled="Number(product.stock) <= 0"
                @click="cart.addToCart(product)"
              >
                Add to Cart
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="wishlist.removeFromWishlist(product.documentId)"
              >
                Remove
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Saved products that were deactivated or deleted in Product Management -->
      <v-alert
        v-if="unavailableIds.length && !loading"
        type="info"
        variant="tonal"
        density="compact"
        class="text-body-2"
      >
        {{ unavailableIds.length }} saved {{ unavailableIds.length === 1 ? 'product is' : 'products are' }} no longer available.
        <template #append>
          <v-btn size="small" variant="text" @click="removeUnavailable">Remove</v-btn>
        </template>
      </v-alert>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const wishlist = useWishlist()
const cart = useCart()
const { products, loading } = useShopProducts()
const { getProductImageUrl } = useStrapi()
const { xs } = useDisplay()

const wishlistProducts = computed(() =>
  products.value.filter((product) => wishlist.isInWishlist(product.documentId)),
)

const unavailableIds = computed(() =>
  wishlist.ids.value.filter((id) => !products.value.some((product) => product.documentId === id)),
)

function removeUnavailable() {
  unavailableIds.value.forEach((id) => wishlist.removeFromWishlist(id))
}
</script>
