// Wishlist state (product documentIds), saved to localStorage by
// plugins/shop-storage.client.ts.

export const WISHLIST_STORAGE_KEY = 'shopkart-wishlist'

export function useWishlist() {
  const ids = useState<string[]>('wishlist-ids', () => [])
  const drawerOpen = useState('wishlist-drawer', () => false)
  const notify = useNotify()

  const count = computed(() => ids.value.length)

  function isInWishlist(documentId: string) {
    return ids.value.includes(documentId)
  }

  function toggleWishlist(product: Product) {
    if (isInWishlist(product.documentId)) {
      removeFromWishlist(product.documentId)
      notify.info(`${product.name} removed from wishlist.`)
    } else {
      ids.value = [...ids.value, product.documentId]
      notify.success(`${product.name} added to wishlist.`)
    }
  }

  function removeFromWishlist(documentId: string) {
    ids.value = ids.value.filter((id) => id !== documentId)
  }

  return { ids, drawerOpen, count, isInWishlist, toggleWishlist, removeFromWishlist }
}
