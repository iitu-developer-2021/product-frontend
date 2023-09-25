import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import * as api from '@/api/requests'
import type { Type } from '@/types'

type TypesParams = {
  successCreateCallback: (createdType: Type) => void
  successEditCallback: (editType: Type) => void
  successDeleteCallback: (deletedTypeId: number) => void
}

export const useTypesCrud = ({
  successCreateCallback,
  successEditCallback,
  successDeleteCallback
}: TypesParams) => {
  const createTypeLoading = ref(false)

  const createType = async (name: string) => {
    try {
      createTypeLoading.value = true
      const response = await api.createTypes(name)
      ElNotification({
        title: 'Успех!',
        message: 'Тип успешно создан',
        type: 'success'
      })
      successCreateCallback(response.result.type)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось создать тип',
        type: 'error'
      })
    } finally {
      createTypeLoading.value = false
    }
  }

  const editTypeLoading = ref(false)

  const editType = async (id: number, name: string) => {
    try {
      editTypeLoading.value = true
      const response = await api.editTypes(id, name)
      ElNotification({
        title: 'Успех!',
        message: 'Тип успешно отредактирован',
        type: 'success'
      })
      successEditCallback(response.result.type)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось отредактировать тип',
        type: 'error'
      })
    } finally {
      editTypeLoading.value = false
    }
  }

  const deleteTypeLoading = ref(false)

  const deleteType = async (id: number) => {
    try {
      deleteTypeLoading.value = true
      await api.deleteTypes(id)
      ElNotification({
        title: 'Успех!',
        message: 'Тип успешно удален',
        type: 'success'
      })
      successDeleteCallback(id)
    } catch (e) {
      console.error((e as any).message)
      ElNotification({
        title: 'Ошибка!',
        message: 'Не удалось удалить тип',
        type: 'error'
      })
    } finally {
      deleteTypeLoading.value = false
    }
  }

  return {
    createType,
    createTypeLoading,
    editType,
    editTypeLoading,
    deleteTypeLoading,
    deleteType
  }
}
