// Shared constants and helpers for the storefront (auto-imported by Nuxt from app/utils).

export interface StrapiImage {
  url: string
  formats?: Record<string, { url: string }>
}

export interface Product {
  id: number
  documentId: string
  name: string
  description?: string | null
  price: number | string
  stock: number
  category?: string | null
  is_active: boolean
  image?: StrapiImage | null
  createdAt?: string
}

// Same categories as the Product Management form (pages/products.vue).
export const SHOP_CATEGORIES = [
  { name: 'Electronics', icon: 'laptop', color: 'blue' },
  { name: 'Fashion', icon: 'shirt', color: 'pink' },
  { name: 'Sports', icon: 'dumbbell', color: 'orange' },
  { name: 'Bags', icon: 'backpack', color: 'brown' },
  { name: 'Beauty', icon: 'sparkles', color: 'purple' },
  { name: 'Home & Living', icon: 'sofa', color: 'teal' },
  { name: 'Toys', icon: 'toy-brick', color: 'amber-darken-2' },
]

// Must match PAYMENT_METHODS in the Strapi checkout controller.
export const PAYMENT_METHODS = [
  { value: 'Cash on Delivery', icon: 'banknote' },
  { value: 'GCash', icon: 'wallet' },
  { value: 'Maya', icon: 'smartphone' },
  { value: 'Bank Transfer', icon: 'landmark' },
]

export function formatCurrency(amount: number | string | null | undefined) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount || 0))
}

// Reads the message Strapi puts in { error: { message } } responses.
export function getApiErrorMessage(error: any, fallback = 'Something went wrong. Please try again.') {
  if (error?.statusCode === undefined && error?.name === 'FetchError' && !error?.data) {
    return 'Cannot reach the server. It may be starting up, please try again in a minute.'
  }
  return error?.data?.error?.message || error?.data?.message || fallback
}

// Extra details (a list of problems) sent by the checkout endpoint.
export function getApiErrorDetails(error: any): string[] {
  const errors = error?.data?.error?.details?.errors
  return Array.isArray(errors) ? errors : []
}
