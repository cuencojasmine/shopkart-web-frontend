// Active products for the storefront, shared by the homepage and the wishlist drawer.

export function useShopProducts() {
  const products = useState<Product[]>('shop-products', () => [])
  const loading = useState('shop-products-loading', () => false)
  const error = useState('shop-products-error', () => '')
  const { fetchProducts } = useStrapi()
  const cart = useCart()

  async function loadProducts() {
    loading.value = true
    error.value = ''

    try {
      // Fetch every product once: active ones are shown in the shop, and the full
      // list lets the cart notice products that were deactivated or deleted.
      const allProducts = await fetchProducts()
      products.value = allProducts.filter((product) => product.is_active)
      cart.syncWithProducts(allProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = getApiErrorMessage(err, 'Unable to load products.')
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, loadProducts }
}
