<!-- app/pages/products.vue -->
<template>
  <v-layout class="product-layout">
    <v-app-bar flat height="76" class="shop-header">
      <v-container class="d-flex align-center">
        <NuxtLink to="/" class="logo-link d-flex align-center ga-2">
          <v-icon icon="mdi-cart" color="primary" size="38" />
          <span class="text-h5 font-weight-bold text-black">
            Shop<span class="text-primary">Kart</span>
          </span>
        </NuxtLink>

        <v-spacer />

        <v-btn to="/" variant="text" prepend-icon="mdi-home-outline">
          Home
        </v-btn>

        <v-btn color="primary" variant="tonal" prepend-icon="mdi-package-variant">
          Manage Products
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="product-page">
      <v-container class="py-8">
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
            prepend-icon="mdi-plus"
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
              prepend-inner-icon="mdi-magnify"
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
            <v-icon icon="mdi-package-variant" size="64" color="grey" />
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
                    <v-icon v-else icon="mdi-image-off" color="grey" />
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
                    <v-btn icon="mdi-eye" variant="text" color="info" size="small" @click="viewProduct(product)" />
                    <v-btn icon="mdi-pencil" variant="text" color="primary" size="small" @click="openEditDialog(product)" />
                    <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="openDeleteDialog(product)" />
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
              <v-btn icon="mdi-close" variant="text" @click="closeProductDialog" />
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
              class="d-flex align-center justify-center bg-grey-lighten-3"
              style="height: 250px"
            >
              <v-icon icon="mdi-image-off" size="80" color="grey" />
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
              <v-icon icon="mdi-delete-alert" size="60" color="error" />
              <h2 class="text-h5 font-weight-bold mt-3">Delete Product?</h2>
              <p class="text-medium-emphasis mt-3">
                Are you sure you want to delete
                <strong>{{ selectedProduct?.name }}</strong>?
              </p>
            </v-card-text>

            <v-card-actions class="pa-5 pt-0">
              <v-btn variant="text" block @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" block :loading="deleting" @click="deleteProduct">
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- SNACKBAR (shows messages set by showSnackbar) -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
          {{ snackbar.message }}
          <template #actions>
            <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
          </template>
        </v-snackbar>
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

const config = useRuntimeConfig()
const STRAPI_URL = config.public.strapiUrl

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

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

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
  const response = await $fetch(`${STRAPI_URL}/api/products`, {
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
  await $fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
}

// ===== 23. UPDATE (uses documentId) =====
async function updateProduct() {
  if (!selectedProduct.value) return

  const response = await $fetch(
    `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
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
    await $fetch(
      `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
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
function showSnackbar(message, color = 'success') {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

function getErrorMessage(error) {
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
  getProducts()
})
</script>

<style scoped>
.product-layout {
  min-height: 100vh;
}

.product-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.shop-header {
  background: #ffffff !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.logo-link {
  text-decoration: none;
  white-space: nowrap;
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
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  background: #f5f5f5;
}

.product-view-image {
  background: #f8f9fa;
}
</style>
