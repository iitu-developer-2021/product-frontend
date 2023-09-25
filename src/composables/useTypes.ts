import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import * as api from '@/api/requests'
import type { Type } from '@/types'

export const useTypes = () => {
  const types = ref<Type[]>([])

  const typesLoading = ref(false)

  const fetchTypes = async () => {
    if (types.value.length > 0) return

    try {
      typesLoading.value = true
      const response = await api.fetchTypes()
      types.value = response.result.types
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось загрузить типы',
        type: 'error'
      })
    } finally {
      typesLoading.value = false
    }
  }
  return {
    fetchTypes,
    types,
    typesLoading
  }
}
