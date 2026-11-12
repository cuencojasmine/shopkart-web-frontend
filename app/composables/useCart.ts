// Shopping cart state shared by every page (useState) and saved to localStorage
// by plugins/shop-storage.client.ts.

export interface CartItem {
  documentId: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl: string
  isActive: boolean
  quantity: number
}

export const CART_STORAGE_KEY = 'shopkart-cart'

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const drawerOpen = useState('cart-drawer', () => false)
  const notify = useNotify()
  const { getProductImageUrl } = useStrapi()

  // ===== Totals =====
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalAmount = computed(() => items.value.reduce((sum, item) => sum + getSubtotal(item), 0))
  const hasProblems = computed(() => items.value.some((item) => getItemProblem(item)))

  function getSubtotal(item: CartItem) {
    return item.price * item.quantity
  }

  // Returns a message when an item cannot be checked out as-is.
  function getItemProblem(item: CartItem) {
    if (!item.isActive) return 'This product is no longer available.'
    if (item.stock <= 0) return 'Out of stock.'
    if (item.quantity > item.stock) return `Only ${item.stock} left in stock.`
    return ''
  }

  function findItem(documentId: string) {
    return items.value.find((item) => item.documentId === documentId)
  }

  // ===== Add / update / remove =====
  function addToCart(product: Product, quantity = 1) {
    const stock = Number(product.stock) || 0

    if (!product.is_active) {
      notify.error(`${product.name} is not available.`)
      return false
    }

    if (stock <= 0) {
      notify.error(`${product.name} is out of stock.`)
      return false
    }

    const existing = findItem(product.documentId)
    const currentQuantity = existing?.quantity || 0

    if (currentQuantity + quantity > stock) {
      notify.warning(`Only ${stock} ${product.name} in stock. You already have ${currentQuantity} in your cart.`)
      return false
    }

    if (existing) {
      existing.quantity += quantity
      refreshItem(existing, product)
    } else {
      items.value.push({
        documentId: product.documentId,
        name: product.name,
        price: Number(product.price) || 0,
        stock,
        category: product.category || 'Uncategorized',
        imageUrl: getProductImageUrl(product.image, 'small'),
        isActive: product.is_active,
        quantity,
      })
    }

    notify.success(`${product.name} added to cart.`)
    return true
  }

  function updateQuantity(documentId: string, quantity: number) {
    const item = findItem(documentId)
    if (!item) return

    const wanted = Math.floor(Number(quantity) || 0)

    if (wanted < 1) {
      item.quantity = 1
      return
    }

    if (wanted > item.stock) {
      item.quantity = Math.max(item.stock, 1)
      notify.warning(`Only ${item.stock} ${item.name} in stock.`)
      return
    }

    item.quantity = wanted
  }

  function increase(documentId: string) {
    const item = findItem(documentId)
    if (item) updateQuantity(documentId, item.quantity + 1)
  }

  function decrease(documentId: string) {
    const item = findItem(documentId)
    if (item && item.quantity > 1) updateQuantity(documentId, item.quantity - 1)
  }

  function removeFromCart(documentId: string) {
    const item = findItem(documentId)
    items.value = items.value.filter((cartItem) => cartItem.documentId !== documentId)
    if (item) notify.info(`${item.name} removed from cart.`)
  }

  function clearCart() {
    items.value = []
  }

  // ===== Keep cart data in sync with the latest Strapi products =====
  function refreshItem(item: CartItem, product: Product) {
    item.name = product.name
    item.price = Number(product.price) || 0
    item.stock = Number(product.stock) || 0
    item.category = product.category || 'Uncategorized'
    item.imageUrl = getProductImageUrl(product.image, 'small')
    item.isActive = product.is_active
  }

  // `products` must be the complete list (active and inactive) so that an
  // item missing from it means the product was deleted.
  function syncWithProducts(products: Product[]) {
    for (const item of items.value) {
      const product = products.find((p) => p.documentId === item.documentId)

      if (product) {
        refreshItem(item, product)
      } else {
        item.isActive = false
        item.stock = 0
      }
    }
  }

  return {
    items,
    drawerOpen,
    totalItems,
    totalAmount,
    hasProblems,
    getSubtotal,
    getItemProblem,
    findItem,
    addToCart,
    updateQuantity,
    increase,
    decrease,
    removeFromCart,
    clearCart,
    syncWithProducts,
  }
}
