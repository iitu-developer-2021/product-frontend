import { ref } from 'vue'
import * as api from '@/api/requests'

import type { Product } from '@/types'

export const useProducts = () => {
  const products = ref<Product[]>([])
  const productsLoading = ref(false)

  const fetchProducts = async () => {
    if (products.value.length > 0) return
    try {
      productsLoading.value = true
      const response = await api.fetchProducts()
      products.value = response.result.products
    } catch (e) {
      console.error((e as any).message)
    } finally {
      productsLoading.value = false
    }
  }

  return {
    fetchProducts,
    products,
    productsLoading
  }
}
