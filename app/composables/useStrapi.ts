// Strapi REST API calls used by the storefront.

export function useStrapi() {
  const config = useRuntimeConfig()
  // Set NUXT_PUBLIC_STRAPI_URL in production (e.g. https://shopkart-server.onrender.com).
  const STRAPI_URL = String(config.public.strapiUrl).replace(/\/+$/, '')

  // Builds a full image URL. Uses a smaller Strapi format when one exists.
  function getProductImageUrl(image?: StrapiImage | null, size: 'small' | 'medium' | 'original' = 'original') {
    if (!image?.url) return ''

    const url = size !== 'original' ? image.formats?.[size]?.url || image.url : image.url

    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${STRAPI_URL}${url}`
  }

  // GET /api/products?populate=image (optionally only active products)
  async function fetchProducts(options: { activeOnly?: boolean } = {}) {
    const query: Record<string, string | number | boolean> = {
      populate: 'image',
      sort: 'createdAt:desc',
      'pagination[pageSize]': 100,
    }

    if (options.activeOnly) {
      query['filters[is_active][$eq]'] = true
    }

    const response = await $fetch<{ data: Product[] }>(`${STRAPI_URL}/api/products`, { query })
    return response.data || []
  }

  // POST /api/products/checkout (custom route in shopkart-server)
  async function checkout(payload: {
    customer: {
      fullName: string
      contactNumber: string
      deliveryAddress: string
      paymentMethod: string
    }
    items: { documentId: string; quantity: number }[]
  }) {
    const response = await $fetch<{ data: any }>(`${STRAPI_URL}/api/products/checkout`, {
      method: 'POST',
      body: { data: payload },
    })
    return response.data
  }

  return { STRAPI_URL, getProductImageUrl, fetchProducts, checkout }
}
