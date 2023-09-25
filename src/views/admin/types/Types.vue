import type { useTypes } from '@/composables/useTypes';
<template>
  <div class="types">
    <div class="types__body">
      <div class="types__top">
        <h1 class="types__titles">Список типов товара</h1>
        <el-button type="primary" @click="showAddModal = true"> Добавить тип </el-button>
      </div>

      <el-table
        v-loading="typesLoading"
        :data="typesWithPagination"
        empty-text="Таблица пустая"
        height="500"
      >
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="Название типа" />
        <el-table-column align="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="
                (editTypeId = scope.row.id), (editTypeName = scope.row.name), (showEditModal = true)
              "
            >
              Редактировать
            </el-button>

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

      <types-modal
        width="600"
        v-model="showAddModal"
        v-model:type-name="addTypeName"
        title="Добавить тип"
        :loading="createTypeLoading"
        @cancel="(showAddModal = false), (addTypeName = '')"
        @confirm="createType(addTypeName)"
      />

      <types-modal
        width="600"
        v-model="showEditModal"
        v-model:type-name="editTypeName"
        title="Редактировать тип"
        :loading="editTypeLoading"
        @cancel="(showEditModal = false), (editTypeName = ''), (editTypeId = null)"
        @confirm="editType(editTypeId!, editTypeName)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
//@ts-ignore
import { useTypesCrud } from './useTypesCrud'
import { useTypes } from '@/composables/useTypes'
import TypesModal from './TypesModal.vue'

const { types, typesLoading, fetchTypes } = useTypes()

onMounted(() => {
  fetchTypes()
})

const showAddModal = ref(false)
const addTypeName = ref('')

const editTypeId = ref<number | null>(null)
const editTypeName = ref('')
const showEditModal = ref(false)

const pageSize = ref(10)
const currentPage = ref(1)

const typesWithPagination = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  const typesCopy = [...types.value]
  return typesCopy.slice(start, end)
})

const { createType, createTypeLoading, editType, editTypeLoading, deleteTypeLoading, deleteType } =
  useTypesCrud({
    successCreateCallback: (createType) => {
      types.value.push(createType)
      showAddModal.value = false
      addTypeName.value = ''
    },
    successDeleteCallback: (deleteId: number) => {
      types.value = types.value.filter((type) => type.id !== deleteId)
    },
    successEditCallback: (editType) => {
      const currentType = types.value.findIndex((type) => type.id === editType.id)
      types.value[currentType].name = editType.name
      editTypeName.value = ''
      editTypeId.value = null
      showEditModal.value = false
    }
  })
</script>
<style lang="scss" scoped>
.types {
  padding: rem(25) rem(25);

  &__body {
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
    gap: gap(15);
    margin-bottom: rem(15);
  }
}

.pagination {
  margin-top: rem(15);
}
</style>
