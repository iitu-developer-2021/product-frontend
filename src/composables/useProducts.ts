import { ref } from 'vue'
//@ts-ignore
import * as api from '@/api/requests.ts'

import type { Product } from '@/types'
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

export const useProducts = () => ({
  fetchProducts,
  products,
  productsLoading
})
