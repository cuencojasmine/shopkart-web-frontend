<!-- app/pages/checkout.vue — Checkout All -->
<template>
  <v-container class="py-8 checkout-page">
    <v-btn to="/" variant="text" prepend-icon="arrow-left" class="mb-4 px-2">
      Continue Shopping
    </v-btn>

    <!-- ========================================
         SUCCESS
    ========================================= -->
    <v-card v-if="order" variant="flat" class="mx-auto sk-surface" max-width="720">
      <v-card-text class="pa-8">
        <div class="text-center">
          <v-avatar color="success" variant="tonal" size="80">
            <v-icon icon="check" size="44" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold mt-4">Order placed successfully!</h1>
          <p class="text-medium-emphasis mt-2">
            Thank you, {{ order.customer.fullName }}. Your order reference is
            <strong class="text-primary">{{ order.reference }}</strong>.
          </p>
        </div>

        <v-divider class="my-6" />

        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.documentId">
              <td>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatCurrency(item.price) }} each · {{ item.remainingStock }} left in stock
                </div>
              </td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatCurrency(item.subtotal) }}</td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex justify-space-between mt-4">
          <span class="text-medium-emphasis">Total items</span>
          <strong>{{ order.totalItems }}</strong>
        </div>
        <div class="d-flex justify-space-between mt-1">
          <span class="text-medium-emphasis">Total amount</span>
          <strong class="text-h6 text-primary">{{ formatCurrency(order.totalAmount) }}</strong>
        </div>

        <v-alert type="info" variant="tonal" class="mt-6 text-body-2">
          <div><strong>Deliver to:</strong> {{ order.customer.deliveryAddress }}</div>
          <div><strong>Contact:</strong> {{ order.customer.contactNumber }}</div>
          <div><strong>Payment:</strong> {{ order.customer.paymentMethod }}</div>
        </v-alert>

        <div class="d-flex flex-wrap justify-center ga-3 mt-6">
          <v-btn color="primary" size="large" to="/" prepend-icon="shopping-bag">Continue Shopping</v-btn>
          <v-btn variant="tonal" size="large" to="/products" prepend-icon="package-open">View Stock</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- ========================================
         EMPTY CART
    ========================================= -->
    <v-card v-else-if="!cart.items.value.length" variant="flat" class="mx-auto sk-surface" max-width="560">
      <v-card-text class="text-center pa-10">
        <v-icon icon="shopping-cart" size="72" color="grey" />
        <h1 class="text-h5 font-weight-bold mt-4">Your cart is empty</h1>
        <p class="text-medium-emphasis mt-2">Add some products before checking out.</p>
        <v-btn color="primary" to="/" class="mt-6" prepend-icon="shopping-bag">Go Shopping</v-btn>
      </v-card-text>
    </v-card>

    <!-- ========================================
         CHECKOUT FORM + ORDER SUMMARY
    ========================================= -->
    <template v-else>
      <div class="sk-eyebrow">Checkout All</div>
      <h1 class="checkout-title mb-1">Checkout</h1>
      <p class="text-medium-emphasis mb-6">Review your items and enter your delivery details.</p>

      <v-row>
        <!-- CUSTOMER INFORMATION -->
        <v-col cols="12" md="7">
          <v-card variant="flat" class="sk-surface">
            <v-card-title class="pa-5 d-flex align-center font-weight-bold">
              <v-avatar color="primary" variant="tonal" rounded="lg" size="36" class="mr-3">
                <v-icon icon="user" size="20" />
              </v-avatar>
              Customer Information
            </v-card-title>
            <v-divider />

            <v-card-text class="pa-5">
              <v-form ref="checkoutForm" :disabled="placingOrder" @submit.prevent="placeOrder">
                <v-text-field
                  v-model="customer.fullName"
                  label="Full Name"
                  prepend-inner-icon="user"
                  variant="outlined"
                  :rules="fullNameRules"
                  autocomplete="name"
                  class="mb-2"
                />
                <v-text-field
                  v-model="customer.contactNumber"
                  label="Contact Number"
                  placeholder="09XXXXXXXXX"
                  prepend-inner-icon="phone"
                  variant="outlined"
                  :rules="contactRules"
                  autocomplete="tel"
                  hint="Philippine mobile number, e.g. 09171234567"
                  class="mb-2"
                />
                <v-textarea
                  v-model="customer.deliveryAddress"
                  label="Delivery Address"
                  prepend-inner-icon="map-pin"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  :rules="addressRules"
                  autocomplete="street-address"
                  placeholder="House no., street, barangay, city, province"
                  class="mb-2"
                />

                <div class="text-subtitle-1 font-weight-bold mb-2">Payment Method</div>
                <v-radio-group v-model="customer.paymentMethod" :rules="paymentRules">
                  <v-row dense>
                    <v-col v-for="method in PAYMENT_METHODS" :key="method.value" cols="12" sm="6">
                      <v-card
                        variant="outlined"
                        rounded="lg"
                        class="payment-option"
                        :class="{ 'payment-active': customer.paymentMethod === method.value }"
                        @click="customer.paymentMethod = method.value"
                      >
                        <v-radio :value="method.value" color="primary" class="px-2">
                          <template #label>
                            <v-icon :icon="method.icon" class="mr-2" />
                            {{ method.value }}
                          </template>
                        </v-radio>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-radio-group>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ORDER SUMMARY -->
        <v-col cols="12" md="5">
          <v-card variant="flat" class="summary-card sk-surface">
            <v-card-title class="pa-5 d-flex align-center font-weight-bold">
              <v-avatar color="primary" variant="tonal" rounded="lg" size="36" class="mr-3">
                <v-icon icon="receipt-text" size="20" />
              </v-avatar>
              Order Summary
              <v-spacer />
              <v-btn
                icon="refresh-cw"
                variant="text"
                size="small"
                :loading="refreshing"
                aria-label="Refresh stock"
                @click="refreshCart"
              />
            </v-card-title>
            <v-divider />

            <v-card-text class="pa-5">
              <CartItemRow v-for="item in cart.items.value" :key="item.documentId" :item="item" class="mb-3" />

              <v-divider class="my-4" />

              <div class="d-flex justify-space-between mb-1">
                <span class="text-medium-emphasis">Total items</span>
                <span class="font-weight-bold">{{ cart.totalItems.value }}</span>
              </div>
              <div class="d-flex justify-space-between mb-1">
                <span class="text-medium-emphasis">Product subtotal</span>
                <span class="font-weight-bold">{{ formatCurrency(cart.totalAmount.value) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-medium-emphasis">Shipping</span>
                <span class="font-weight-bold text-success">FREE</span>
              </div>
              <v-divider class="mb-3" />
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-1 font-weight-bold">Total amount</span>
                <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(cart.totalAmount.value) }}</span>
              </div>

              <!-- Errors from the client-side check or from Strapi -->
              <v-alert
                v-if="checkoutError"
                type="error"
                variant="tonal"
                class="mt-4 text-body-2"
                closable
                @click:close="clearCheckoutError"
              >
                <div class="font-weight-bold">{{ checkoutError }}</div>
                <ul v-if="checkoutErrorDetails.length" class="mt-1 pl-4">
                  <li v-for="detail in checkoutErrorDetails" :key="detail">{{ detail }}</li>
                </ul>
              </v-alert>

              <v-alert
                v-else-if="cart.hasProblems.value"
                type="warning"
                variant="tonal"
                class="mt-4 text-body-2"
              >
                Some items are unavailable or exceed the available stock. Update or remove them to continue.
              </v-alert>

              <v-btn
                block
                size="x-large"
                color="primary"
                rounded="pill"
                class="mt-4 place-order-btn"
                prepend-icon="circle-check"
                :loading="placingOrder"
                :disabled="cart.hasProblems.value || refreshing"
                @click="placeOrder"
              >
                Place Order · {{ formatCurrency(cart.totalAmount.value) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
useHead({ title: 'Checkout | ShopKart' })

const cart = useCart()
const notify = useNotify()
const { checkout } = useStrapi()
const { loadProducts, error: productsError } = useShopProducts()

// ===== Form state =====
const checkoutForm = ref()
const customer = reactive({
  fullName: '',
  contactNumber: '',
  deliveryAddress: '',
  paymentMethod: '',
})

const fullNameRules = [
  (value: string) => !!value?.trim() || 'Full name is required',
  (value: string) => value.trim().length >= 2 || 'Full name is too short',
]
const contactRules = [
  (value: string) => !!value?.trim() || 'Contact number is required',
  (value: string) =>
    /^(09|\+639)\d{9}$/.test(value.replace(/[\s-]/g, '')) || 'Use 09XXXXXXXXX or +639XXXXXXXXX',
]
const addressRules = [
  (value: string) => !!value?.trim() || 'Delivery address is required',
  (value: string) => value.trim().length >= 10 || 'Please enter a complete address',
]
const paymentRules = [(value: string) => !!value || 'Please choose a payment method']

// ===== Checkout state =====
const refreshing = ref(false)
const placingOrder = ref(false)
const checkoutError = ref('')
const checkoutErrorDetails = ref<string[]>([])
const order = ref<any>(null)

function clearCheckoutError() {
  checkoutError.value = ''
  checkoutErrorDetails.value = []
}

// Re-reads products from Strapi so stock, price, and active status are current.
async function refreshCart() {
  refreshing.value = true
  await loadProducts()
  refreshing.value = false

  if (productsError.value) {
    notify.error(productsError.value)
    return false
  }
  return true
}

async function placeOrder() {
  clearCheckoutError()

  // 1. Validate the form fields
  const { valid } = await checkoutForm.value.validate()
  if (!valid) {
    notify.error('Please complete the required fields.')
    return
  }

  placingOrder.value = true

  try {
    // 2. Check the cart against the latest Strapi data
    if (!(await refreshCart())) return

    if (cart.hasProblems.value) {
      checkoutError.value = 'Your cart changed. Some items are no longer available in that quantity.'
      checkoutErrorDetails.value = cart.items.value
        .filter((item) => cart.getItemProblem(item))
        .map((item) => `${item.name}: ${cart.getItemProblem(item)}`)
      return
    }

    // 3. Send the order; Strapi validates again and deducts the stock
    const result = await checkout({
      customer: {
        fullName: customer.fullName.trim(),
        contactNumber: customer.contactNumber.replace(/[\s-]/g, ''),
        deliveryAddress: customer.deliveryAddress.trim(),
        paymentMethod: customer.paymentMethod,
      },
      items: cart.items.value.map((item) => ({
        documentId: item.documentId,
        quantity: item.quantity,
      })),
    })

    // 4. Success: clear the cart only now, then refresh product stock
    order.value = result
    cart.clearCart()
    notify.success('Checkout successful! Stock has been updated.')
    await loadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Checkout failed:', error)
    checkoutError.value = getApiErrorMessage(error, 'Checkout failed. Please try again.')
    checkoutErrorDetails.value = getApiErrorDetails(error)
    notify.error(checkoutError.value)
    // Show the latest stock so the shopper can fix the cart. The cart is kept.
    await loadProducts()
  } finally {
    placingOrder.value = false
  }
}

onMounted(() => {
  if (cart.items.value.length) refreshCart()
})
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
}

.checkout-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

@media (min-width: 840px) {
  .summary-card {
    position: sticky;
    top: 96px;
  }
}

.summary-card :deep(.v-card-title),
.sk-surface :deep(.v-card-title) {
  white-space: normal;
}

.place-order-btn {
  box-shadow: 0 12px 24px -10px rgba(var(--sk-brand-800-rgb), 0.7);
}

.payment-option {
  cursor: pointer;
  border-radius: 14px !important;
  border-color: var(--sk-border) !important;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.payment-active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.05);
}
</style>
