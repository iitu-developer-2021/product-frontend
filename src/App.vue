<template>
  <admin-layout>
    <router-view />
  </admin-layout>
</template>
<script setup lang="ts">
import AdminLayout from './layouts/AdminLayout.vue'
//@ts-ignore
import * as api from './api/products/index.ts'
//@ts-ignore
import { Product } from './types/index'
import { onMounted } from 'vue'
import { ref } from 'vue'

const products = ref<Product[]>([])
const productsLoading = ref(false)

const fetchProducts = async () => {
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

onMounted(() => {
  fetchProducts()
})
</script>
