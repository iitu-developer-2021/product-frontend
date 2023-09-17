<template>
  <div class="types">
    <div class="types__wrapper">
      <div class="types__top">
        <h1 class="types__title">Список типов товара</h1>
        <el-button type="primary" @click="addTypeListener">Добавить тип</el-button>
      </div>

      <el-table
        v-loading="typeLoading"
        :data="typesWithPagination"
        empty-text="Таблица пустая"
        height="500"
      >
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="Название типа" />
        <el-table-column align="right">
          <template #default="scope">
            <el-button size="small" @click="editTypeListener(scope.row)">Редактировать</el-button>

            <el-popconfirm
              width="220"
              confirm-button-text="Удалить"
              cancel-button-text="Нет, cпасибо"
              title="Вы точно хотите удалить тип ?"
              @confirm="deleteType(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" :loading="deleteTypeLoading">
                  Удалить
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :hide-on-single-page="true"
        class="pagination"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        background
        layout="total, prev, pager, next"
        :total="types.length"
      />

      <el-dialog v-model="showModal" class="dialog" align-center>
        <h1>Создание типа товара</h1>
        <el-input placeholder="Введите название типа" class="dialog__input" v-model="typeName" />
        <div class="dialog__actions">
          <el-button type="info" @click="(showModal = false), (typeName = '')">Отменить</el-button>
          <el-button
            type="primary"
            :loading="createTypeLoading || editTypeLoading"
            @click="saveListener(typeName)"
          >
            Cохранить
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElNotification } from 'element-plus'
import type { Type } from '@/types'
import * as api from '@/api/requests'

const typeName = ref('')
let modalType: 'add' | 'edit' = 'add'
let tempEditType: Type | null = null
const showModal = ref(false)

const pageSize = ref(10)
const currentPage = ref(1)

const types = ref<Type[]>([])
const typeLoading = ref(false)

const typesWithPagination = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  const typesCopy = [...types.value]
  return typesCopy.slice(start, end)
})

const fetchTypes = async () => {
  try {
    typeLoading.value = true
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
    typeLoading.value = false
  }
}

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
    types.value.push(response.result.type)
    typeName.value = ''
    showModal.value = false
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

const editType = async (name: string) => {
  try {
    editTypeLoading.value = true
    const response = await api.editTypes(tempEditType!.id, name)
    ElNotification({
      title: 'Успех!',
      message: 'Тип успешно отредактирован',
      type: 'success'
    })
    const currentType = types.value.findIndex((type) => type.id === response.result.type.id)
    types.value[currentType].name = name
    typeName.value = ''
    showModal.value = false
    tempEditType = null
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
    types.value = types.value.filter((type) => type.id !== id)
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

const editTypeListener = (type: Type) => {
  tempEditType = type
  typeName.value = type.name
  modalType = 'edit'
  showModal.value = true
}

const addTypeListener = () => {
  tempEditType = null
  typeName.value = ''
  modalType = 'add'
  showModal.value = true
}

const saveListener = (name: string) => {
  if (!name) {
    return ElNotification({
      title: 'Предупреждение!',
      message: 'Поле не может быть пустым',
      type: 'warning'
    })
  }

  if (modalType === 'add') {
    createType(name)
  } else {
    editType(name)
  }
}
onMounted(() => {
  fetchTypes()
})
</script>

<style lang="scss" scoped>
.types {
  padding: rem(35);

  &__wrapper {
    background: #fff;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-radius: rem(5);
    padding: rem(15);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(10);
    margin-bottom: rem(35);
  }
}

.dialog {
  &__input {
    margin-top: rem(20);
  }

  &__actions {
    margin-top: rem(20);
    display: flex;
    justify-content: flex-end;
  }
}

.pagination {
  margin-top: rem(20);
}
</style>
