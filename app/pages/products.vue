<!-- app/pages/products.vue -->
<template>
  <v-layout class="product-layout">
    <v-app-bar flat height="72" class="shop-header" :class="{ 'shop-header--clear': !auth.isSignedIn.value }">
      <v-container class="d-flex align-center ga-2">
        <BrandLogo small />

        <v-spacer />

        <v-btn to="/" variant="text" prepend-icon="store" class="d-none d-sm-flex">
          Back to Store
        </v-btn>
        <v-btn to="/" variant="text" icon="store" aria-label="Back to Store" class="d-flex d-sm-none" />

        <ThemeToggle />

        <template v-if="auth.isSignedIn.value">
          <v-btn
            variant="tonal"
            rounded="pill"
            prepend-icon="log-out"
            class="d-none d-sm-flex"
            @click="signOut"
          >
            Sign out ({{ auth.username.value }})
          </v-btn>
          <v-btn
            icon="log-out"
            variant="text"
            aria-label="Sign out"
            class="d-flex d-sm-none"
            @click="signOut"
          />
        </template>
      </v-container>
    </v-app-bar>

    <v-main class="product-page">
      <!-- ========================================
           SIGN IN (only Store Manager accounts can change products)
      ========================================= -->
      <div v-if="!auth.isSignedIn.value" class="login-scene">
        <!-- Sky backdrop: rings behind the card and clouds along the bottom -->
        <div class="login-sky" aria-hidden="true">
          <span class="login-ring login-ring--1" />
          <span class="login-ring login-ring--2" />
          <span class="login-ring login-ring--3" />
          <span class="login-clouds" />
        </div>

        <section class="login-card" aria-labelledby="login-title">
          <div class="login-icon">
            <img src="/logo.png" alt="" width="34" height="34" />
          </div>

          <h1 id="login-title" class="login-title">Store Manager sign in</h1>
          <p class="login-subtitle">
            Add, edit and remove ShopKart products. Only Store Manager accounts can sign in.
          </p>

          <v-form ref="loginForm" class="login-form" @submit.prevent="signIn">
            <v-text-field
              v-model="credentials.identifier"
              class="login-field"
              placeholder="Email or username"
              aria-label="Email or username"
              prepend-inner-icon="mail"
              variant="solo-filled"
              density="comfortable"
              flat
              hide-details="auto"
              autocomplete="username"
              :rules="[(value) => !!value?.trim() || 'Email or username is required']"
            />
            <v-text-field
              v-model="credentials.password"
              class="login-field"
              placeholder="Password"
              aria-label="Password"
              prepend-inner-icon="lock"
              variant="solo-filled"
              density="comfortable"
              flat
              hide-details="auto"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'eye' : 'eye-off'"
              autocomplete="current-password"
              :rules="[(value) => !!value || 'Password is required']"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-alert v-if="loginError" type="error" variant="tonal" density="compact" class="mb-4 text-left">
              {{ loginError }}
            </v-alert>

            <v-btn type="submit" class="login-submit" size="large" block :loading="signingIn">
              Sign in
            </v-btn>
          </v-form>
        </section>
      </div>

      <v-container v-else class="py-8">
        <!-- PAGE HEADER -->
        <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Product Management</h1>
            <p class="text-medium-emphasis mt-1 mb-0">
              Manage your e-commerce products
            </p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="plus"
            size="large"
            @click="openCreateDialog"
          >
            Add Product
          </v-btn>
        </div>

        <!-- SEARCH -->
        <v-card class="mb-6" rounded="lg" elevation="1">
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Search product"
              prepend-inner-icon="search"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-card-text>
        </v-card>

        <!-- LOADING STATE -->
        <div v-if="loading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" size="50" />
          <div class="mt-4 text-medium-emphasis">Loading products...</div>
        </div>

        <!-- EMPTY STATE -->
        <v-card
          v-else-if="filteredProducts.length === 0"
          rounded="lg"
          elevation="1"
        >
          <v-card-text class="text-center py-16">
            <v-icon icon="package-open" size="64" color="grey" />
            <h3 class="mt-4">No Products Found</h3>
            <p class="text-medium-emphasis mt-2">
              Add your first product or try another search.
            </p>
          </v-card-text>
        </v-card>

        <!-- PRODUCT TABLE -->
        <v-card v-else rounded="lg" elevation="1" class="product-table-card">
          <v-table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="product in filteredProducts" :key="product.documentId">
                <td>
                  <v-avatar rounded="lg" size="70" class="my-2">
                    <v-img
                      v-if="product.image"
                      :src="getImageUrl(product.image)"
                      :alt="product.name"
                      cover
                    />
                    <v-icon v-else icon="image-off" color="grey" />
                  </v-avatar>
                </td>

                <td>
                  <div class="font-weight-bold">{{ product.name }}</div>
                  <div class="description-text text-medium-emphasis">
                    {{ product.description || 'No description' }}
                  </div>
                </td>

                <td>
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ product.category || 'Uncategorized' }}
                  </v-chip>
                </td>

                <td class="font-weight-bold">{{ formatPrice(product.price) }}</td>

                <td>
                  <v-chip :color="getStockColor(product.stock)" variant="tonal" size="small">
                    {{ product.stock }}
                  </v-chip>
                </td>

                <td>
                  <v-chip :color="product.is_active ? 'success' : 'error'" variant="tonal" size="small">
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </td>

                <td>
                  <div class="d-flex justify-center ga-1">
                    <v-btn icon="eye" variant="text" color="info" size="small" @click="viewProduct(product)" />
                    <v-btn icon="pencil" variant="text" color="primary" size="small" @click="openEditDialog(product)" />
                    <v-btn icon="trash" variant="text" color="error" size="small" @click="openDeleteDialog(product)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- ========================================
             CREATE / EDIT PRODUCT DIALOG
        ========================================= -->
        <v-dialog v-model="productDialog" max-width="700" persistent>
          <v-card rounded="xl">
            <v-card-title class="d-flex align-center justify-space-between pa-5">
              <span class="text-h5 font-weight-bold">
                {{ isEditing ? 'Edit Product' : 'Add Product' }}
              </span>
              <v-btn icon="x" variant="text" @click="closeProductDialog" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-6">
              <v-form ref="productForm" @submit.prevent="saveProduct">
                <div v-if="imagePreview || currentImage" class="image-preview mb-4">
                  <v-img :src="imagePreview || getImageUrl(currentImage)" height="220" contain />
                </div>

                <v-file-input
                  v-model="selectedFile"
                  label="Select Product Image"
                  variant="outlined"
                  accept="image/*"
                  @update:model-value="handleImageChange"
                />

                <v-text-field
                  v-model="form.name"
                  label="Product Name"
                  variant="outlined"
                  :rules="[(value) => !!value || 'Product name is required']"
                />

                <v-textarea v-model="form.description" label="Description" variant="outlined" rows="3" />

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.price"
                      label="Price"
                      type="number"
                      variant="outlined"
                      :rules="priceRules"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.stock"
                      label="Stock"
                      type="number"
                      variant="outlined"
                      :rules="stockRules"
                    />
                  </v-col>
                </v-row>

                <v-select v-model="form.category" :items="categories" label="Category" variant="outlined" />
                <v-switch v-model="form.is_active" label="Active Product" color="success" inset />
              </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-5">
              <v-spacer />
              <v-btn variant="text" @click="closeProductDialog">Cancel</v-btn>
              <v-btn color="primary" :loading="saving" @click="saveProduct">
                {{ isEditing ? 'Update Product' : 'Save Product' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- ========================================
             VIEW PRODUCT DIALOG
        ========================================= -->
        <v-dialog v-model="viewDialog" max-width="600">
          <v-card v-if="selectedProduct" rounded="xl">
            <!-- PRODUCT IMAGE -->
            <v-img
              v-if="selectedProduct.image"
              :src="getImageUrl(selectedProduct.image)"
              height="320"
              contain
              class="product-view-image"
            />

            <!-- NO IMAGE PLACEHOLDER -->
            <div
              v-else
              class="d-flex align-center justify-center no-image-panel"
              style="height: 250px"
            >
              <v-icon icon="image-off" size="80" color="grey" />
            </div>

            <!-- PRODUCT INFORMATION -->
            <v-card-text class="pa-6">
              <div class="d-flex align-start justify-space-between ga-4">
                <div>
                  <h2 class="text-h5 font-weight-bold">
                    {{ selectedProduct.name }}
                  </h2>

                  <v-chip class="mt-2" color="primary" variant="tonal" size="small">
                    {{ selectedProduct.category || 'Uncategorized' }}
                  </v-chip>
                </div>

                <v-chip
                  :color="selectedProduct.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>

              <p class="mt-5 text-medium-emphasis">
                {{ selectedProduct.description || 'No product description.' }}
              </p>

              <v-divider class="my-5" />

              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-medium-emphasis">Price</div>
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ formatPrice(selectedProduct.price) }}
                  </div>
                </v-col>

                <v-col cols="6">
                  <div class="text-caption text-medium-emphasis">Stock</div>
                  <div class="text-h6 font-weight-bold">
                    {{ selectedProduct.stock }} units
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-5 pt-0">
              <v-spacer />
              <v-btn color="primary" variant="tonal" @click="viewDialog = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- ========================================
             DELETE CONFIRMATION DIALOG
        ========================================= -->
        <v-dialog v-model="deleteDialog" max-width="450">
          <v-card rounded="xl">
            <v-card-text class="text-center pa-8">
              <v-icon icon="trash" size="60" color="error" />
              <h2 class="text-h5 font-weight-bold mt-3">Delete Product?</h2>
              <p class="text-medium-emphasis mt-3">
                Are you sure you want to delete
                <strong>{{ selectedProduct?.name }}</strong>?
              </p>
            </v-card-text>

            <v-card-actions class="pa-5 pt-0">
              <v-btn variant="text" block @click="deleteDialog = false">Cancel</v-btn>
              <!-- Hold-to-confirm instead of a single click. If the delete fails the
                   dialog stays open and the button resets itself after resetAfter. -->
              <BitsHoldButton
                :key="selectedProduct?.documentId"
                block
                done-label="Deleting…"
                @hold="deleteProduct"
              >
                <v-icon icon="trash" size="16" />
                Hold to delete
              </BitsHoldButton>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Messages from showSnackbar appear as toasts (components/ToastStack.vue in app.vue) -->
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
// @ts-nocheck

// ===== 6. Page settings and Strapi URL =====
definePageMeta({
  layout: false,
})

useHead({
  title: 'Product Management | ShopKart',
})

const { STRAPI_URL } = useStrapi()

// Create, update, delete and upload need a signed-in Store Manager.
// auth.authFetch() works like $fetch but adds "Authorization: Bearer <jwt>".
const auth = useAuth()
const loginForm = ref(null)
const credentials = reactive({ identifier: '', password: '' })
const showPassword = ref(false)
const signingIn = ref(false)
const loginError = ref('')

async function signIn() {
  const validation = await loginForm.value?.validate()
  if (validation && !validation.valid) return

  signingIn.value = true
  loginError.value = ''

  try {
    await auth.login(credentials.identifier.trim(), credentials.password)
    credentials.password = ''
    showSnackbar(`Welcome, ${auth.username.value}!`, 'success')
    await getProducts()
  } catch (error) {
    loginError.value = getApiErrorMessage(error, 'Unable to sign in.')
  } finally {
    signingIn.value = false
  }
}

async function signOut() {
  await auth.logout()
  showSnackbar('Signed out.', 'info')
}

// If the session expires mid-task, close any open dialog so the sign-in form shows.
watch(auth.isSignedIn, (signedIn) => {
  if (!signedIn) {
    productDialog.value = false
    deleteDialog.value = false
    viewDialog.value = false
  }
})

// ===== 9. State variables =====
const products = ref([])
const loading = ref(false)
const search = ref('')

const productDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)

const selectedProduct = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const productForm = ref(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  is_active: true,
})

const selectedFile = ref(null)
const imagePreview = ref(null)
const currentImage = ref(null)

// ===== 10. Categories, validation, and snackbar state =====
const categories = [
  'Electronics',
  'Fashion',
  'Sports',
  'Bags',
  'Beauty',
  'Home & Living',
  'Toys',
]

const priceRules = [
  (value) => value >= 0 || 'Price cannot be negative',
]

const stockRules = [
  (value) => value >= 0 || 'Stock cannot be negative',
]

const notify = useNotify()

// ===== 12. Search filter =====
const filteredProducts = computed(() => {
  if (!search.value) {
    return products.value
  }

  const keyword = search.value.toLowerCase().trim()

  return products.value.filter((product) => {
    const name = product.name?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''

    return (
      name.includes(keyword) ||
      description.includes(keyword) ||
      category.includes(keyword)
    )
  })
})

// ===== 13. READ =====
async function getProducts() {
  loading.value = true

  try {
    const response = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })

    products.value = response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    showSnackbar('Unable to load products.', 'error')
  } finally {
    loading.value = false
  }
}

// ===== Dialog functions =====
function openCreateDialog() {
  resetForm()
  isEditing.value = false
  selectedProduct.value = null
  productDialog.value = true
}

function openEditDialog(product) {
  selectedProduct.value = product
  isEditing.value = true

  form.name = product.name || ''
  form.description = product.description || ''
  form.price = Number(product.price) || 0
  form.stock = Number(product.stock) || 0
  form.category = product.category || ''
  form.is_active = product.is_active ?? true

  currentImage.value = product.image || null
  selectedFile.value = null
  imagePreview.value = null
  productDialog.value = true
}

function viewProduct(product) {
  selectedProduct.value = product
  viewDialog.value = true
}

function openDeleteDialog(product) {
  selectedProduct.value = product
  deleteDialog.value = true
}

// ===== 24. Decide between CREATE and UPDATE =====
async function saveProduct() {
  const validation = await productForm.value?.validate()
  if (validation && !validation.valid) return

  saving.value = true

  try {
    if (isEditing.value) {
      await updateProduct()
    } else {
      await createProduct()
    }

    closeProductDialog()
    await getProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}

// ===== 19. CREATE =====
async function createProduct() {
  const response = await auth.authFetch('/api/products', {
    method: 'POST',
    body: {
      data: {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        is_active: form.is_active,
      },
    },
  })

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product created successfully.', 'success')
}

// ===== 20. Upload and attach the Product image =====
async function uploadProductImage(productId) {
  const file = getSelectedFile()
  if (!file) return

  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::product.product')
  formData.append('refId', String(productId))
  formData.append('field', 'image')

  // Do not set Content-Type manually; the browser adds the multipart boundary.
  await auth.authFetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
}

// ===== 23. UPDATE (uses documentId) =====
async function updateProduct() {
  if (!selectedProduct.value) return

  const response = await auth.authFetch(
    `/api/products/${selectedProduct.value.documentId}`,
    {
      method: 'PUT',
      body: {
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          is_active: form.is_active,
        },
      },
    },
  )

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product updated successfully.', 'success')
}

// ===== 25. DELETE (uses documentId) =====
async function deleteProduct() {
  if (!selectedProduct.value) return

  deleting.value = true

  try {
    await auth.authFetch(
      `/api/products/${selectedProduct.value.documentId}`,
      { method: 'DELETE' },
    )

    deleteDialog.value = false
    showSnackbar('Product deleted successfully.', 'success')
    await getProducts()
  } catch (error) {
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
  }
}

// ===== 16 & 21. Image, price, and stock helpers =====
function getImageUrl(image) {
  if (!image?.url) return ''

  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url
  }

  return `${STRAPI_URL}${image.url}`
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(price || 0))
}

function getStockColor(stock) {
  if (Number(stock) === 0) return 'error'
  if (Number(stock) <= 5) return 'warning'
  return 'success'
}

function handleImageChange(value) {
  const file = getFileFromValue(value)

  if (!file) {
    imagePreview.value = null
    return
  }

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = URL.createObjectURL(file)
}

function getSelectedFile() {
  return getFileFromValue(selectedFile.value)
}

function getFileFromValue(value) {
  if (!value) return null
  if (value instanceof File) return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

// ===== 27.2 Snackbar and error helpers =====
// color is 'success' | 'error' | 'warning' | 'info'
function showSnackbar(message, color = 'success') {
  notify[color](message)
}

function getErrorMessage(error) {
  if (error?.statusCode === 403) {
    return 'This account is not allowed to manage products. Sign in as a Store Manager.'
  }

  return (
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.message ||
    'Something went wrong.'
  )
}

// ===== 28. Reset and close the form =====
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.stock = 0
  form.category = ''
  form.is_active = true

  selectedFile.value = null
  currentImage.value = null

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = null
}

function closeProductDialog() {
  productDialog.value = false
  resetForm()
}

onMounted(() => {
  auth.restoreSession()
  if (auth.isSignedIn.value) getProducts()
})
</script>

<style scoped>
.product-layout {
  min-height: 100vh;
}

.product-page {
  min-height: 100vh;
  background: var(--sk-bg);
}

.shop-header {
  background: var(--sk-glass-bg) !important;
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
  border-bottom: 1px solid var(--sk-border);
}

.logo-link {
  text-decoration: none;
  white-space: nowrap;
}

/* ===== Store Manager sign-in ===== */
.shop-header--clear {
  background: transparent !important;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border-bottom-color: transparent;
}

.login-scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 72px);
  min-height: calc(100dvh - 72px);
  padding: 32px 16px 72px;
}

/* Fixed so the sky also fills the area behind the transparent app bar */
.login-sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--sk-login-sky);
}

/* Thin rings centered on the card, fading out toward the bottom */
.login-ring {
  position: absolute;
  top: 54%;
  left: 50%;
  border: 1px solid var(--sk-login-ring);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 45%, transparent 75%);
  mask-image: linear-gradient(180deg, #000 0%, #000 45%, transparent 75%);
}

.login-ring--1 {
  width: 620px;
  height: 620px;
}

.login-ring--2 {
  width: 900px;
  height: 900px;
}

.login-ring--3 {
  width: 1200px;
  height: 1200px;
}

/* Soft cloud bank built from overlapping, blurred ellipses */
.login-clouds {
  position: absolute;
  inset: auto -10% -6% -10%;
  height: 52%;
  filter: blur(14px);
  background:
    radial-gradient(ellipse 22% 38% at 6% 62%, var(--sk-login-cloud) 0%, transparent 70%),
    radial-gradient(ellipse 18% 30% at 20% 48%, var(--sk-login-cloud) 0%, transparent 70%),
    radial-gradient(ellipse 26% 42% at 34% 78%, var(--sk-login-cloud) 0%, transparent 72%),
    radial-gradient(ellipse 20% 34% at 52% 70%, var(--sk-login-cloud) 0%, transparent 70%),
    radial-gradient(ellipse 18% 32% at 68% 50%, var(--sk-login-cloud) 0%, transparent 70%),
    radial-gradient(ellipse 24% 40% at 82% 66%, var(--sk-login-cloud) 0%, transparent 72%),
    radial-gradient(ellipse 20% 36% at 96% 46%, var(--sk-login-cloud) 0%, transparent 70%),
    linear-gradient(180deg, transparent 55%, var(--sk-login-cloud) 100%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 28px;
  text-align: center;
  background: var(--sk-login-card);
  border: 1px solid var(--sk-login-card-border);
  border-radius: 24px;
  box-shadow: var(--sk-login-card-shadow);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  animation: login-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 18px;
  background: var(--sk-login-tile);
  border: 1px solid var(--sk-login-card-border);
  border-radius: 16px;
  box-shadow:
    0 10px 20px -10px rgba(var(--sk-brand-900-rgb), 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.login-icon img {
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 9px;
}

.login-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--sk-ink);
}

.login-subtitle {
  max-width: 300px;
  margin: 6px auto 24px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--sk-muted);
}

.login-form {
  text-align: left;
}

.login-field {
  margin-bottom: 12px;
}

.login-field :deep(.v-field) {
  background: var(--sk-login-field);
  border-radius: 10px;
  font-size: 14px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.login-field :deep(.v-field--focused) {
  background: var(--sk-login-field-focus);
  box-shadow: 0 0 0 2px rgba(var(--sk-brand-500-rgb), 0.45);
}

.login-field :deep(.v-field__prepend-inner .v-icon),
.login-field :deep(.v-field__append-inner .v-icon) {
  font-size: 18px;
  color: var(--sk-muted);
  opacity: 1;
}

.login-field :deep(input::placeholder) {
  color: var(--sk-placeholder);
  opacity: 1;
}

.login-submit {
  margin-top: 6px;
  height: 46px !important;
  border-radius: 10px;
  color: var(--sk-login-btn-ink) !important;
  background: var(--sk-login-btn) !important;
  box-shadow:
    0 10px 20px -10px rgba(var(--sk-brand-900-rgb), 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

@keyframes login-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 599px) {
  .login-card {
    padding: 28px 20px 24px;
  }
}

.product-table-card {
  overflow-x: auto;
}

.description-text {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.image-preview {
  overflow: hidden;
  border: 1px solid var(--sk-border);
  border-radius: 12px;
  background: var(--sk-img-tile);
}

.product-view-image {
  background: var(--sk-img-tile);
}

.no-image-panel {
  background: var(--sk-tile);
}
</style>
