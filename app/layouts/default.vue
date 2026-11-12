<!-- Storefront layout: App Bar, cart & wishlist drawers, and footer.
     Used by pages/index.vue and pages/checkout.vue. No v-layout here: <v-app>
     in app.vue is the layout, so the App Bar and drawers stay fixed while scrolling.
     pages/products.vue sets layout: false and keeps its own header. -->
<template>
  <div class="shop-layout">
    <!-- ===== APP BAR (floating glass pill) ===== -->
    <!-- order=1 puts the app bar after the drawers in Vuetify's layout, so the cart and
         wishlist drawers open full-height over the header instead of below it. -->
    <v-app-bar flat height="84" color="transparent" class="shop-header" :order="1">
      <v-container class="py-0 px-3 px-sm-4">
        <nav class="nav-pill sk-glass d-flex align-center" aria-label="Main">
          <BrandLogo :small="xs" />

          <div class="nav-links d-none d-lg-flex align-center ml-8">
            <NuxtLink v-for="link in navLinks" :key="link.title" :to="link.to" class="nav-link">
              {{ link.title }}
            </NuxtLink>
          </div>

          <v-spacer />

          <ThemeToggle />

          <v-btn icon variant="text" size="small" class="nav-icon" aria-label="Open wishlist" @click="wishlist.drawerOpen.value = true">
            <v-badge :content="wishlist.count.value" :model-value="wishlist.count.value > 0" color="pink" offset-x="-2" offset-y="-2">
              <v-icon icon="heart" size="22" />
            </v-badge>
          </v-btn>

          <v-btn icon variant="text" size="small" class="nav-icon" aria-label="Open cart" @click="cart.drawerOpen.value = true">
            <v-badge :content="cart.totalItems.value" :model-value="cart.totalItems.value > 0" color="primary" offset-x="-2" offset-y="-2">
              <v-icon icon="shopping-bag" size="22" />
            </v-badge>
          </v-btn>

          <v-btn
            to="/products"
            color="primary"
            variant="flat"
            prepend-icon="package"
            class="d-none d-sm-flex ml-2"
            rounded="pill"
          >
            Manage Products
          </v-btn>

          <!-- Small screens: page links + Manage Products in a menu -->
          <v-menu location="bottom end" offset="12">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" icon="menu" variant="text" size="small" class="d-lg-none ml-1" aria-label="Open menu" />
            </template>
            <v-list rounded="xl" min-width="220" class="py-2" elevation="8">
              <v-list-item v-for="link in navLinks" :key="link.title" :to="link.to" :prepend-icon="link.icon" :title="link.title" />
              <v-divider class="my-2" />
              <v-list-item to="/products" prepend-icon="package" title="Manage Products" base-color="primary" />
            </v-list>
          </v-menu>
        </nav>
      </v-container>
    </v-app-bar>

    <CartDrawer />
    <WishlistDrawer />

    <v-main class="shop-main">
      <slot />

      <!-- ===== FOOTER ===== -->
      <footer class="shop-footer">
        <v-container class="pt-12 pb-8">
          <v-row>
            <v-col cols="12" md="4">
              <BrandLogo small />
              <p class="footer-text mt-4">
                Your one-stop online store for gadgets, fashion, sports gear, beauty, and home essentials.
              </p>
              <div class="d-flex flex-wrap ga-2 mt-4">
                <span v-for="method in PAYMENT_METHODS" :key="method.value" class="pay-chip">
                  <v-icon :icon="method.icon" size="14" class="mr-1" />{{ method.value }}
                </span>
              </div>
            </v-col>

            <v-col cols="6" md="2" offset-md="1">
              <div class="footer-title">Shop</div>
              <NuxtLink v-for="category in SHOP_CATEGORIES.slice(0, 4)" :key="category.name" :to="{ path: '/', query: { category: category.name }, hash: '#products' }" class="footer-link">
                {{ category.name }}
              </NuxtLink>
            </v-col>

            <v-col cols="6" md="2">
              <div class="footer-title">Customer Service</div>
              <span class="footer-link">Shipping &amp; Delivery</span>
              <span class="footer-link">Returns &amp; Refunds</span>
              <span class="footer-link">Payment Methods</span>
              <NuxtLink to="/products" class="footer-link">Manage Products</NuxtLink>
            </v-col>

            <v-col cols="12" md="3">
              <div class="footer-title">Contact</div>
              <div class="footer-link"><v-icon icon="map-pin" size="16" class="mr-2" />Philippines</div>
              <div class="footer-link"><v-icon icon="mail" size="16" class="mr-2" />support@shopkart.test</div>
              <div class="footer-link"><v-icon icon="phone" size="16" class="mr-2" />(02) 8000-0000</div>
            </v-col>
          </v-row>

          <div class="footer-bottom mt-8 pt-6 d-flex flex-column flex-sm-row justify-space-between ga-2">
            <span>&copy; {{ year }} ShopKart. All rights reserved.</span>
            <span>Web Systems and Technologies Final Project</span>
          </div>
        </v-container>
      </footer>
    </v-main>
    <!-- Notifications render in app.vue (components/ToastStack.vue). -->
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const cart = useCart()
const wishlist = useWishlist()
const { products, loading, loadProducts } = useShopProducts()
const { xs } = useDisplay()

const year = new Date().getFullYear()

const navLinks = [
  { title: 'Home', to: '/', icon: 'house' },
  { title: 'Shop', to: { path: '/', hash: '#products' }, icon: 'store' },
  { title: 'Categories', to: { path: '/', hash: '#categories' }, icon: 'shapes' },
  { title: 'Deals', to: { path: '/', hash: '#deals' }, icon: 'tag' },
]

// Pages load products themselves; this covers any page that did not.
onMounted(() => {
  if (!products.value.length && !loading.value) loadProducts()
})
</script>

<style scoped>
.shop-layout {
  min-height: 100vh;
}

.shop-header {
  background: transparent !important;
}

.shop-header :deep(.v-toolbar__content) {
  padding: 0;
}

.nav-pill {
  height: 60px;
  padding: 0 10px 0 16px;
  border-radius: 20px;
}

.nav-link {
  position: relative;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sk-ink-soft);
  text-decoration: none;
  border-radius: 10px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.nav-icon {
  color: var(--sk-ink-soft);
}

.shop-main {
  background: var(--sk-bg);
  min-height: 100vh;
}

.shop-footer {
  background: var(--sk-surface);
  border-top: 1px solid var(--sk-border);
  margin-top: 24px;
}

.footer-text {
  color: var(--sk-muted);
  font-size: 14px;
  line-height: 1.6;
  max-width: 340px;
}

.footer-title {
  font-weight: 800;
  font-size: 14px;
  margin-bottom: 14px;
  color: var(--sk-ink);
}

.footer-link {
  display: flex;
  align-items: center;
  color: var(--sk-muted);
  font-size: 14px;
  margin-bottom: 10px;
  text-decoration: none;
}

a.footer-link:hover {
  color: rgb(var(--v-theme-primary));
}

.pay-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sk-ink-soft);
  background: var(--sk-tile);
  border: 1px solid var(--sk-border);
  border-radius: 8px;
}

.footer-bottom {
  border-top: 1px solid var(--sk-border);
  font-size: 13px;
  color: var(--sk-muted);
}
</style>
