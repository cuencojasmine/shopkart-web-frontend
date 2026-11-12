<!-- One cart line: image, price, quantity controls, subtotal, remove. -->
<template>
  <v-card variant="flat" rounded="xl" class="sk-surface" :class="{ 'border-error': problem }">
    <div class="d-flex pa-3 ga-3">
      <v-avatar rounded="lg" size="72" class="flex-shrink-0 sk-thumb">
        <v-img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="sk-product-img" />
        <v-icon v-else icon="image-off" color="grey" />
      </v-avatar>

      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-start">
          <div class="flex-grow-1 min-w-0">
            <div class="font-weight-bold text-truncate">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ formatCurrency(item.price) }} each · {{ item.stock }} in stock
            </div>
          </div>
          <v-btn
            icon="trash"
            variant="text"
            color="error"
            size="small"
            density="comfortable"
            :aria-label="`Remove ${item.name}`"
            @click="cart.removeFromCart(item.documentId)"
          />
        </div>

        <div class="d-flex align-center justify-space-between mt-2">
          <div class="qty-control d-flex align-center">
            <v-btn
              icon="minus"
              size="x-small"
              variant="tonal"
              aria-label="Decrease quantity"
              :disabled="item.quantity <= 1 || !item.isActive"
              @click="cart.decrease(item.documentId)"
            />
            <input
              :value="item.quantity"
              type="number"
              min="1"
              :max="item.stock"
              class="qty-input"
              aria-label="Quantity"
              :disabled="!item.isActive || item.stock <= 0"
              @change="onQuantityInput"
            >
            <v-btn
              icon="plus"
              size="x-small"
              variant="tonal"
              aria-label="Increase quantity"
              :disabled="item.quantity >= item.stock || !item.isActive"
              @click="cart.increase(item.documentId)"
            />
          </div>

          <span class="font-weight-bold">{{ formatCurrency(cart.getSubtotal(item)) }}</span>
        </div>

        <div v-if="problem" class="text-caption text-error mt-1">
          <v-icon icon="circle-alert" size="14" /> {{ problem }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ item: CartItem }>()

const cart = useCart()
const problem = computed(() => cart.getItemProblem(props.item))

function onQuantityInput(event: Event) {
  const input = event.target as HTMLInputElement
  cart.updateQuantity(props.item.documentId, Number(input.value))
  // Show the corrected value if the typed one was out of range.
  input.value = String(props.item.quantity)
}
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

.qty-input {
  width: 44px;
  text-align: center;
  font-weight: 600;
  border: 1px solid var(--sk-border);
  border-radius: 8px;
  color: var(--sk-ink);
  background: var(--sk-surface);
  margin: 0 6px;
  padding: 2px 0;
  -moz-appearance: textfield;
  appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
