import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import type { Product } from '@/types'
import * as api from '@/api/requests'

type ProductsCrud = {
  successCreateCallback: (createdProduct: Product) => void
  successDeleteCallback: (deletedProductId: number) => void
  successEditCallback: (editedProduct: Product) => void
}

export const useProductsCrud = ({
  successCreateCallback,
  successDeleteCallback,
  successEditCallback
}: ProductsCrud) => {
  const createProductLoading = ref(false)

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      createProductLoading.value = true
      const response = await api.createProduct(product)
      ElNotification({
        title: 'Успех!',
        message: 'Товар успешно создан',
        type: 'success'
      })
      successCreateCallback(response.result.product)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось создать тип',
        type: 'error'
      })
    } finally {
      createProductLoading.value = false
    }
  }

  const deleteProductLoading = ref(false)

  const deleteProduct = async (id: number) => {
    try {
      deleteProductLoading.value = true
      await api.deleteProduct(id)
      ElNotification({
        title: 'Успех!',
        message: 'Продукт успешно удален',
        type: 'success'
      })
      successDeleteCallback(id)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось удалить продукт',
        type: 'error'
      })
    } finally {
      deleteProductLoading.value = false
    }
  }

  const editProductLoading = ref(false)

  const editProduct = async (product: Product) => {
    try {
      editProductLoading.value = true
      const response = await api.editProduct(product)
      ElNotification({
        title: 'Успех!',
        message: 'Продукт успешно отредактирован',
        type: 'success'
      })
      successEditCallback(response.result.product)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось отредактировать товар',
        type: 'error'
      })
    } finally {
      editProductLoading.value = false
    }
  }

  return {
    createProduct,
    createProductLoading,
    deleteProduct,
    deleteProductLoading,
    editProduct,
    editProductLoading
  }
}
