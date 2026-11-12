<!-- app/pages/index.vue — E-Commerce Homepage -->
<template>
  <div>
    <!-- ========================================
         HERO SECTION (bento showcase of Strapi products)
    ========================================= -->
    <section class="hero">
      <div class="hero-orb hero-orb-1" />
      <div class="hero-orb hero-orb-2" />

      <v-container class="hero-inner">
        <v-row align="center">
          <v-col cols="12" md="6" class="pr-md-8">
            <span class="hero-chip">
              <v-icon icon="zap" size="16" color="primary" class="mr-1" />
              New arrivals every week
            </span>
            <h1 class="hero-title mt-5">
              Shop smarter.<br>Live better.
            </h1>
            <p class="hero-subtitle mt-4">
              Gadgets, fashion, sports gear, beauty, and home essentials, all in one place
              with free delivery and secure checkout.
            </p>
            <div class="d-flex flex-wrap ga-3 mt-8">
              <v-btn size="x-large" color="primary" rounded="pill" append-icon="arrow-right" class="hero-cta" @click="scrollToProducts">
                Shop Now
              </v-btn>
              <v-btn size="x-large" variant="text" rounded="pill" prepend-icon="package" to="/products">
                Manage Products
              </v-btn>
            </div>

            <div class="hero-stats d-flex ga-6 mt-8">
              <div>
                <div class="stat-value">
                  <span v-if="isFirstLoad" class="sk-skel stat-skel" aria-label="Loading" />
                  <BitsCountUp v-else :to="products.length" :duration="1.2" />
                </div>
                <div class="stat-label">Products</div>
              </div>
              <div>
                <div class="stat-value"><BitsCountUp :to="SHOP_CATEGORIES.length" :duration="1.2" :delay="0.15" /></div>
                <div class="stat-label">Categories</div>
              </div>
              <div>
                <div class="stat-value">Free</div>
                <div class="stat-label">Delivery</div>
              </div>
            </div>
          </v-col>

          <!-- Bento showcase: featured product + two smaller tiles -->
          <v-col cols="12" md="6">
            <div class="hero-bento">
              <template v-if="heroProducts.length">
                <button
                  v-for="(product, index) in heroProducts"
                  :key="product.documentId"
                  type="button"
                  class="hero-tile sk-glass"
                  :class="index === 0 ? 'hero-tile-main' : 'hero-tile-side'"
                  :aria-label="`Find ${product.name}`"
                  @click="findProduct(product)"
                >
                  <span v-if="index === 0" class="tile-badge">Featured</span>
                  <v-img
                    :src="getProductImageUrl(product.image, index === 0 ? 'medium' : 'small')"
                    :alt="product.name"
                    class="tile-img sk-product-img"
                  />
                  <span class="tile-label">
                    <span class="tile-name text-truncate">{{ product.name }}</span>
                    <span class="tile-price">{{ formatCurrency(product.price) }}</span>
                  </span>
                </button>
              </template>
              <!-- Loading: tiles shaped like the real ones (image + name/price label) -->
              <template v-else-if="isFirstLoad">
                <div
                  v-for="n in 3"
                  :key="n"
                  class="hero-tile hero-tile-skel sk-glass"
                  :class="n === 1 ? 'hero-tile-main' : 'hero-tile-side'"
                  aria-hidden="true"
                >
                  <span v-if="n === 1" class="sk-skel sk-skel-pill tile-badge-skel" />
                  <span class="sk-skel tile-img-skel" />
                  <span class="tile-label">
                    <span class="sk-skel" style="width: 55%; height: 12px" />
                    <span class="sk-skel" style="width: 34%; height: 12px" />
                  </span>
                </div>
              </template>
              <template v-else>
                <div v-for="n in 3" :key="n" class="hero-tile sk-glass d-flex align-center justify-center" :class="n === 1 ? 'hero-tile-main' : 'hero-tile-side'">
                  <v-icon icon="shopping-bag" size="56" color="primary" class="opacity-40" />
                </div>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ========================================
         FLOATING SEARCH (filters the product grid below)
    ========================================= -->
    <v-container class="search-wrap">
      <form class="search-pill" role="search" @submit.prevent="scrollToProducts">
        <v-icon icon="search" class="search-icon ml-2" />
        <input
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Search by name, description, or category"
          aria-label="Search products"
        >
        <v-btn type="submit" color="primary" rounded="pill" :icon="xs" class="flex-shrink-0" aria-label="Search">
          <v-icon v-if="xs" icon="arrow-right" />
          <span v-else>Search</span>
        </v-btn>
      </form>
    </v-container>

    <!-- ========================================
         PROMO / FEATURE STRIP
    ========================================= -->
    <v-container class="pt-8 pb-2">
      <div class="features">
        <div v-for="feature in features" :key="feature.title" class="feature">
          <span class="feature-icon">
            <v-icon :icon="feature.icon" size="22" />
          </span>
          <div class="min-w-0">
            <div class="feature-title">{{ feature.title }}</div>
            <div class="feature-text">{{ feature.text }}</div>
          </div>
        </div>
      </div>
    </v-container>

    <!-- ========================================
         CATEGORY TICKER (looping quick links; pauses on hover)
    ========================================= -->
    <v-container class="pt-4 pb-0">
      <BitsLogoLoop :items="SHOP_CATEGORIES" :speed="45" aria-label="Shop by category">
        <template #item="{ item }">
          <button
            type="button"
            class="ticker-chip"
            :class="{ 'ticker-chip-active': selectedCategory === item.name }"
            :aria-pressed="selectedCategory === item.name"
            @click="selectCategory(item.name)"
          >
            <v-icon :icon="item.icon" size="18" :color="item.color" />
            <span>{{ item.name }}</span>
            <span class="ticker-count">{{ categoryCounts[item.name] || 0 }}</span>
          </button>
        </template>
      </BitsLogoLoop>
    </v-container>

    <!-- ========================================
         PRODUCT CATEGORIES (clay tiles)
    ========================================= -->
    <section id="categories">
      <v-container class="py-10">
        <div class="section-head">
          <div>
            <div class="sk-eyebrow">Browse</div>
            <h2 class="sk-section-title">Explore Categories</h2>
          </div>
          <v-btn v-if="selectedCategory !== ALL_CATEGORIES" variant="text" color="primary" append-icon="x" @click="clearCategory">
            All Categories
          </v-btn>
        </div>

        <div class="category-row sk-scroll-x">
          <button
            v-for="category in SHOP_CATEGORIES"
            :key="category.name"
            type="button"
            class="category-tile sk-clay"
            :class="{ 'category-active': selectedCategory === category.name }"
            :aria-pressed="selectedCategory === category.name"
            @click="selectCategory(category.name)"
          >
            <v-avatar :color="category.color" variant="tonal" size="56" class="category-icon">
              <v-icon :icon="category.icon" size="28" />
            </v-avatar>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">
              {{ categoryCounts[category.name] || 0 }} {{ categoryCounts[category.name] === 1 ? 'item' : 'items' }}
            </span>
          </button>
        </div>
      </v-container>
    </section>

    <!-- ========================================
         PRODUCTS (category filter + sort; search comes from the floating search bar)
    ========================================= -->
    <v-container id="products" class="pb-12">
      <div class="section-head">
        <div>
          <div class="sk-eyebrow">Catalog</div>
          <h2 class="sk-section-title">Our Products</h2>
        </div>
        <span v-if="isFirstLoad" class="sk-skel" style="width: 110px; height: 14px" />
        <span v-else-if="!error" class="text-body-2 text-medium-emphasis">
          Showing {{ filteredProducts.length }} of {{ products.length }}
        </span>
      </div>

      <!-- Search lives in the floating search bar under the hero; this toolbar only filters and sorts -->
      <div class="toolbar sk-surface mb-4">
        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              label="Category"
              :prepend-inner-icon="xs ? undefined : 'shapes'"
              variant="solo-filled"
              flat
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              :prepend-inner-icon="xs ? undefined : 'arrow-up-down'"
              variant="solo-filled"
              flat
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>
      </div>

      <div v-if="(selectedCategory !== ALL_CATEGORIES || search) && !loading && !error" class="d-flex flex-wrap align-center ga-2 mb-4">
        <span class="text-body-2 text-medium-emphasis">Filters:</span>
        <v-chip
          v-if="selectedCategory !== ALL_CATEGORIES"
          closable
          size="small"
          color="primary"
          @click:close="clearCategory"
        >
          {{ selectedCategory }}
        </v-chip>
        <v-chip v-if="search" closable size="small" color="primary" @click:close="search = ''">
          "{{ search }}"
        </v-chip>
        <v-btn size="small" variant="text" @click="clearFilters">Clear all</v-btn>
      </div>

      <!-- LOADING: placeholders shaped like ProductCard -->
      <v-row v-if="isFirstLoad" :dense="xs" aria-busy="true" aria-label="Loading products">
        <v-col v-for="n in 8" :key="n" cols="6" md="4" lg="3">
          <ProductCardSkeleton />
        </v-col>
      </v-row>

      <!-- API ERROR -->
      <div v-else-if="error" class="state-card sk-surface">
        <v-avatar color="error" variant="tonal" size="72">
          <v-icon icon="cloud-alert" size="36" />
        </v-avatar>
        <h3 class="mt-4">Could not load products</h3>
        <p class="text-medium-emphasis mt-2">{{ error }}</p>
        <v-btn color="primary" class="mt-5" prepend-icon="refresh-cw" :loading="loading" @click="loadProducts">
          Try Again
        </v-btn>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!filteredProducts.length" class="state-card sk-surface">
        <v-avatar color="grey" variant="tonal" size="72">
          <v-icon icon="package-x" size="36" />
        </v-avatar>
        <h3 class="mt-4">No products found</h3>
        <p class="text-medium-emphasis mt-2">
          {{ products.length ? 'Try another search or category.' : 'There are no active products yet.' }}
        </p>
        <v-btn v-if="products.length" color="primary" variant="tonal" class="mt-5" @click="clearFilters">
          Show All Products
        </v-btn>
        <v-btn v-else color="primary" variant="tonal" class="mt-5" to="/products">
          Add Products
        </v-btn>
      </div>

      <!-- PRODUCT GRID -->
      <v-row v-else :dense="xs">
        <v-col v-for="product in filteredProducts" :key="product.documentId" cols="6" md="4" lg="3">
          <ProductCard :product="product" />
        </v-col>
      </v-row>
    </v-container>

    <!-- ========================================
         PROMOTIONAL BANNERS (bento)
    ========================================= -->
    <section id="deals">
      <v-container class="pb-12">
        <div class="section-head">
          <div>
            <div class="sk-eyebrow">Promos</div>
            <h2 class="sk-section-title">Deals For You</h2>
          </div>
        </div>

        <div class="promo-bento">
          <div v-for="promo in promos" :key="promo.category" class="promo" :class="`promo-${promo.theme}`">
            <div class="promo-content">
              <div class="promo-eyebrow">{{ promo.eyebrow }}</div>
              <h3 class="promo-title">{{ promo.title }}</h3>
              <p class="promo-text">{{ promo.text }}</p>
              <v-btn
                :color="promo.theme === 'dark' ? 'white' : 'primary'"
                variant="flat"
                rounded="pill"
                append-icon="arrow-right"
                :class="promo.theme === 'dark' ? 'text-brand-900' : ''"
                @click="selectCategory(promo.category)"
              >
                Shop {{ promo.category }}
              </v-btn>
            </div>
            <div class="promo-art">
              <v-img
                v-if="categoryImages[promo.category]"
                :src="categoryImages[promo.category]"
                :alt="`${promo.category} product`"
                class="promo-img sk-product-img"
              />
              <span v-else-if="isFirstLoad" class="sk-skel promo-skel" aria-hidden="true" />
              <v-icon v-else :icon="promo.icon" class="promo-icon" />
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- ========================================
         NEWSLETTER
    ========================================= -->
    <v-container class="pb-12">
      <section class="newsletter">
        <div class="newsletter-orb" />
        <v-row align="center" class="position-relative">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <div class="newsletter-eyebrow">Newsletter</div>
            <h2 class="newsletter-title">Subscribe to our newsletter</h2>
            <p class="newsletter-text mt-2">
              Get updates on new products, exclusive deals, and promos straight to your inbox.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-form ref="newsletterForm" class="newsletter-form d-flex flex-column flex-sm-row ga-2" @submit.prevent="subscribe">
              <v-text-field
                v-model="newsletterEmail"
                placeholder="Enter your email address"
                type="email"
                variant="solo"
                flat
                density="comfortable"
                prepend-inner-icon="mail"
                :rules="emailRules"
                class="flex-grow-1"
              />
              <v-btn type="submit" size="large" color="white" class="newsletter-btn">Subscribe</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

useHead({ title: 'ShopKart | Online Store' })

const ALL_CATEGORIES = 'All Categories'

const route = useRoute()
const router = useRouter()
const notify = useNotify()
const { xs } = useDisplay()
const { getProductImageUrl } = useStrapi()
const { products, loading, error, loadProducts } = useShopProducts()

// Skeletons only on the first load. Later refreshes keep showing the products already on screen.
// `!error` hides them when the request fails, `!loading` covers the moment before onMounted fires.
const loaded = ref(false)
watch(loading, (isLoading) => {
  if (!isLoading) loaded.value = true
})
const isFirstLoad = computed(() => !products.value.length && !error.value && (loading.value || !loaded.value))

// ===== Filters =====
const search = ref('')
const selectedCategory = ref(getCategoryFromRoute())
const sortBy = ref('newest')

const categoryOptions = [ALL_CATEGORIES, ...SHOP_CATEGORIES.map((category) => category.name)]

const sortOptions = [
  { title: 'Newest', value: 'newest' },
  { title: 'Price: Low to High', value: 'price-asc' },
  { title: 'Price: High to Low', value: 'price-desc' },
  { title: 'Name: A to Z', value: 'name' },
]

const features = [
  { title: 'Free Delivery', text: 'On every order', icon: 'truck' },
  { title: 'Secure Checkout', text: 'COD, GCash, Maya', icon: 'shield-check' },
  { title: 'Easy Returns', text: '7-day return policy', icon: 'rotate-ccw' },
  { title: '24/7 Support', text: 'We are here to help', icon: 'headset' },
]

const promos = [
  {
    category: 'Sports',
    theme: 'dark',
    eyebrow: 'Limited time',
    title: 'Sports Season Sale',
    text: 'Gear up for your next game with our sports collection.',
    icon: 'dumbbell',
  },
  {
    category: 'Beauty',
    theme: 'mist',
    eyebrow: 'New collection',
    title: 'Glow Up Beauty Picks',
    text: 'Skincare and makeup favorites, delivered free.',
    icon: 'sparkles',
  },
  {
    category: 'Electronics',
    theme: 'sky',
    eyebrow: 'Tech week',
    title: 'Upgrade Your Setup',
    text: 'Monitors, gadgets, and accessories for work and play.',
    icon: 'laptop',
  },
]

// Search (name, description, category) + category filter + sort.
const filteredProducts = computed(() => {
  const keyword = (search.value || '').toLowerCase().trim()

  const result = products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === ALL_CATEGORIES || product.category === selectedCategory.value

    const matchesSearch =
      !keyword ||
      product.name?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)

    return matchesCategory && matchesSearch
  })

  return [...result].sort((a, b) => {
    if (sortBy.value === 'price-asc') return Number(a.price) - Number(b.price)
    if (sortBy.value === 'price-desc') return Number(b.price) - Number(a.price)
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return 0 // "newest" keeps the Strapi order (sort=createdAt:desc)
  })
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const product of products.value) {
    const category = product.category || 'Uncategorized'
    counts[category] = (counts[category] || 0) + 1
  }
  return counts
})

// Up to 3 products with images for the hero showcase.
const heroProducts = computed(() => products.value.filter((product) => product.image).slice(0, 3))

// First product image in each category, used as the promo banner art.
const categoryImages = computed(() => {
  const images: Record<string, string> = {}
  for (const product of products.value) {
    if (product.category && product.image && !images[product.category]) {
      images[product.category] = getProductImageUrl(product.image, 'small')
    }
  }
  return images
})

function getCategoryFromRoute() {
  const category = route.query.category
  return typeof category === 'string' && categoryOptions.includes(category) ? category : ALL_CATEGORIES
}

// Footer links use /?category=Sports#products
watch(() => route.query.category, () => {
  selectedCategory.value = getCategoryFromRoute()
})

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? ALL_CATEGORIES : category
  scrollToProducts()
}

function clearCategory() {
  selectedCategory.value = ALL_CATEGORIES
  if (route.query.category) router.replace({ query: {}, hash: route.hash })
}

function clearFilters() {
  search.value = ''
  clearCategory()
}

// Hero tile click: search for that product and jump to the grid.
function findProduct(product: Product) {
  search.value = product.name
  selectedCategory.value = ALL_CATEGORIES
  scrollToProducts()
}

function scrollToProducts() {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}

// ===== Newsletter =====
const newsletterForm = ref()
const newsletterEmail = ref('')
const emailRules = [
  (value: string) => !!value || 'Email is required',
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
]

async function subscribe() {
  const { valid } = await newsletterForm.value.validate()
  if (!valid) return

  notify.success(`Thanks! ${newsletterEmail.value} is now subscribed.`)
  newsletterForm.value.reset()
}

// Always fetch fresh products (and stock) when the homepage opens.
onMounted(() => {
  loadProducts()
  if (route.hash) nextTick(() => document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth' }))
})
</script>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  /* Extend the gradient up behind the floating glass App Bar */
  margin-top: calc(var(--v-layout-top, 84px) * -1);
  padding-top: var(--v-layout-top, 84px);
  padding-bottom: 72px;
  background: var(--sk-hero-bg);
}

/* Fades the hero into the page background so there is no hard edge */
.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 140px;
  background: linear-gradient(180deg, transparent, var(--sk-bg));
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.hero-orb-1 {
  width: 14px;
  height: 14px;
  top: 22%;
  left: 48%;
  background: var(--sk-brand-700);
  opacity: 0.5;
}

.hero-orb-2 {
  width: 9px;
  height: 9px;
  top: 70%;
  right: 6%;
  background: var(--sk-brand-500);
  opacity: 0.5;
}

.hero-inner {
  position: relative;
  z-index: 1;
  padding-top: 40px;
  padding-bottom: 16px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sk-accent-ink);
  background: var(--sk-glass-bg);
  border: 1px solid var(--sk-glass-border);
  border-radius: 999px;
  box-shadow: 0 0 0 1px var(--sk-glass-edge), var(--sk-glass-sheen), var(--sk-shadow-sm);
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
}

.hero-title {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.035em;
  text-transform: uppercase;
  color: var(--sk-ink);
}

.hero-subtitle {
  font-size: 1.075rem;
  line-height: 1.6;
  color: var(--sk-ink-subtle);
  max-width: 480px;
}

.hero-cta {
  box-shadow: 0 12px 24px -10px rgba(var(--sk-brand-800-rgb), 0.7);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--sk-ink);
}

.stat-label {
  font-size: 13px;
  color: var(--sk-muted);
}

/* Bento showcase */
.hero-bento {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: 420px;
}

.hero-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 14px;
  border-radius: var(--sk-radius-lg);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 1px var(--sk-glass-edge), var(--sk-glass-sheen), var(--sk-shadow-lg);
}

.hero-tile:focus-visible {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.hero-tile-main {
  grid-row: span 2;
}

.tile-img {
  --sk-img-bg: var(--sk-img-tile);
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 18px;
}

.tile-img :deep(img) {
  object-fit: contain !important;
  padding: 6px;
}

.tile-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 1;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  border-radius: 999px;
}

.tile-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--sk-glass-strong);
  border-radius: 12px;
}

.tile-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--sk-ink);
  min-width: 0;
}

.tile-price {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

.hero-tile-side .tile-label {
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 6px 10px;
}

.hero-tile-side .tile-name {
  max-width: 100%;
}

/* Hero skeleton tiles */
.hero-tile-skel {
  pointer-events: none;
}

.tile-img-skel {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 18px;
}

.tile-badge-skel {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 1;
  width: 78px;
  height: 22px;
}

.hero-tile-side .tile-label > .sk-skel {
  margin: 3px 0;
}

.stat-skel {
  width: 32px;
  height: 1.4rem;
  margin: 3px 0;
}

.promo-skel {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

/* ---------- Floating search ---------- */
.search-wrap {
  position: relative;
  z-index: 2;
  margin-top: -36px;
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 8px 8px 14px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 999px;
  box-shadow: 0 18px 40px -18px var(--sk-shadow-soft);
}

.search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 44px;
  font-size: 15px;
  color: var(--sk-ink);
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--sk-placeholder);
}

.search-icon {
  color: var(--sk-muted);
}

/* ---------- Features ---------- */
.features {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: var(--sk-radius);
}

.feature-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--sk-accent-ink);
  background: var(--sk-selected);
  border-radius: 14px;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
}

.feature-text {
  font-size: 12px;
  color: var(--sk-muted);
}

.min-w-0 {
  min-width: 0;
}

/* ---------- Category ticker (inside BitsLogoLoop) ---------- */
.ticker-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 8px 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sk-ink);
  white-space: nowrap;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 999px;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.ticker-chip:hover {
  border-color: var(--sk-brand-300);
}

.ticker-chip:focus-visible {
  outline: 2px solid var(--sk-brand-700);
  outline-offset: 2px;
}

.ticker-chip-active {
  background: var(--sk-selected);
  border-color: var(--sk-brand-500);
}

.ticker-count {
  min-width: 24px;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--sk-accent-ink);
  text-align: center;
  background: var(--sk-tile);
  border-radius: 999px;
}

/* ---------- Section header ---------- */
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
}

/* ---------- Categories (clay) ---------- */
.category-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 16px;
  padding: 6px 4px 18px;
  margin: -6px -4px 0;
}

.category-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 10px 16px;
  border-radius: 24px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.category-tile:hover {
  transform: translateY(-4px);
}

.category-tile:focus-visible {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.category-icon {
  margin-bottom: 8px;
  box-shadow: inset 0 2px 4px var(--sk-clay-highlight);
}

.category-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--sk-ink);
  text-align: center;
}

.category-count {
  font-size: 12px;
  color: var(--sk-muted);
}

.category-active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow:
    0 0 0 2px rgb(var(--v-theme-primary)),
    0 14px 28px -14px rgba(var(--sk-brand-800-rgb), 0.5);
}

/* ---------- Toolbar + states ---------- */
.toolbar {
  padding: 10px;
}

.toolbar :deep(.v-field) {
  border-radius: 12px;
}

.state-card {
  padding: 48px 24px;
  text-align: center;
}

/* ---------- Promo bento ---------- */
.promo-bento {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  grid-template-rows: repeat(2, minmax(190px, auto));
  gap: 16px;
}

.promo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  padding: 28px;
  border-radius: var(--sk-radius-lg);
}

.promo:first-child {
  grid-row: span 2;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}

.promo-content {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  max-width: 340px;
}

.promo-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.75;
}

.promo-title {
  margin-top: 6px;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.promo:first-child .promo-title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.promo-text {
  margin: 8px 0 18px;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
}

.promo-art {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
}

.promo:first-child .promo-art {
  align-self: flex-end;
  width: min(100%, 300px);
  height: 220px;
}

.promo-img {
  --sk-img-bg: transparent;
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.promo-dark .promo-img {
  --sk-img-bg: #ffffff;
}

.promo-mist .promo-img {
  --sk-img-bg: var(--sk-promo-mist-img);
}

.promo-sky .promo-img {
  --sk-img-bg: var(--sk-promo-sky-img);
}

.promo-img :deep(img) {
  object-fit: contain !important;
}

.promo-icon {
  font-size: 110px !important;
  opacity: 0.25;
}

.promo-dark {
  color: #ffffff;
  background:
    radial-gradient(circle at 80% 85%, rgba(var(--sk-brand-700-rgb), 0.45), transparent 50%),
    linear-gradient(150deg, #172a45 0%, var(--sk-brand-900) 100%);
}

.promo-dark .promo-art {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 12px;
}

.promo-mist {
  color: var(--sk-promo-ink);
  background: var(--sk-promo-mist);
}

.promo-sky {
  color: var(--sk-promo-ink);
  background: var(--sk-promo-sky);
}

/* Dark mode: light cards become navy, so give them an edge against the page */
html[data-theme='dark'] .promo,
html[data-theme='dark'] .newsletter {
  border: 1px solid var(--sk-border);
}

/* ---------- Newsletter ---------- */
.newsletter {
  position: relative;
  overflow: hidden;
  padding: 40px;
  border-radius: var(--sk-radius-lg);
  background: linear-gradient(135deg, var(--sk-brand-900) 0%, var(--sk-brand-800) 60%, var(--sk-brand-700) 100%);
}

.newsletter-orb {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.newsletter-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sk-brand-200);
}

.newsletter-title {
  margin-top: 4px;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.newsletter-text {
  color: var(--sk-brand-200);
}

.newsletter-form :deep(.v-field) {
  border-radius: 14px;
}

.newsletter-btn {
  height: 48px !important;
  color: var(--sk-brand-900) !important;
}

/* ---------- Responsive ---------- */
@media (max-width: 1144px) {
  .category-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 839px) {
  .hero {
    padding-bottom: 64px;
  }

  .hero-inner {
    padding-top: 20px;
  }

  .hero-bento {
    height: 340px;
    margin-top: 8px;
  }

  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .promo-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  .promo:first-child {
    grid-row: auto;
    grid-column: span 2;
    flex-direction: row;
    align-items: center;
  }

  .promo:first-child .promo-art {
    align-self: center;
    width: 200px;
    height: 180px;
  }

  .promo {
    flex-direction: column;
    align-items: flex-start;
  }

  .promo-art {
    align-self: flex-end;
    width: 120px;
    height: 120px;
  }

  .newsletter {
    padding: 32px 24px;
  }
}

@media (max-width: 599px) {
  .hero-stats {
    gap: 20px !important;
  }

  .hero-bento {
    height: 300px;
    gap: 10px;
  }

  .hero-tile {
    padding: 10px;
    border-radius: 20px;
  }

  .hero-tile-side .tile-label {
    padding: 4px 8px;
  }

  .tile-name {
    font-size: 12px;
  }

  .tile-price {
    font-size: 12px;
  }

  .search-pill {
    padding: 6px 6px 6px 10px;
  }

  .search-input {
    font-size: 14px;
  }

  .features {
    gap: 8px;
  }

  .feature {
    padding: 10px;
    gap: 10px;
  }

  .feature-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  /* Categories become a swipeable row on phones */
  .category-row {
    display: flex;
    gap: 12px;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
    margin: -6px -16px 0;
    padding: 6px 16px 18px;
  }

  .category-tile {
    flex: 0 0 120px;
    scroll-snap-align: start;
  }

  .promo-bento {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .promo,
  .promo:first-child {
    grid-column: auto;
    flex-direction: row;
    align-items: center;
    padding: 22px;
  }

  .promo:first-child .promo-art,
  .promo-art {
    align-self: center;
    width: 96px;
    height: 96px;
  }

  .promo-dark .promo-art {
    padding: 8px;
    border-radius: 18px;
  }

  .promo:first-child .promo-title {
    font-size: 1.35rem;
  }
}
</style>
