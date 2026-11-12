// Loads the cart and wishlist from localStorage when the app starts and
// saves them again whenever they change.

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked (private mode); the app still works without it.
  }
}

export default defineNuxtPlugin(() => {
  const cartItems = useState<CartItem[]>('cart-items', () => [])
  const wishlistIds = useState<string[]>('wishlist-ids', () => [])

  const savedCart = readStorage<CartItem[]>(CART_STORAGE_KEY, [])
  cartItems.value = Array.isArray(savedCart)
    ? savedCart.filter((item) => item?.documentId && Number(item.quantity) > 0)
    : []

  const savedWishlist = readStorage<string[]>(WISHLIST_STORAGE_KEY, [])
  wishlistIds.value = Array.isArray(savedWishlist) ? savedWishlist.filter((id) => typeof id === 'string') : []

  watch(cartItems, (value) => writeStorage(CART_STORAGE_KEY, value), { deep: true })
  watch(wishlistIds, (value) => writeStorage(WISHLIST_STORAGE_KEY, value))
})
