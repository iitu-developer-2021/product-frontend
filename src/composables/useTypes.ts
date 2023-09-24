import { ref } from 'vue'
import { ElNotification } from 'element-plus'
//@ts-ignore
import * as api from '@/api/requests.ts'
import type { Type } from '@/types'

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

export const useTypes = () => ({
  fetchTypes,
  types,
  typesLoading
})
