<template>
  <div class="sell-list">
    <div class="sell-list__wrapper">
      <h1 class="sell-list__title">Список продаж</h1>
      <div class="sell-list__filters">
        <div class="sell-list__date">
          <el-date-picker
            v-model="date"
            type="daterange"
            range-separator="по"
            start-placeholder="Дата начало"
            end-placeholder="Дата окончания"
            @change="dateChangeListener"
          />
        </div>
      </div>
      <el-table
        :data="clientSellsWithPagination"
        :border="true"
        empty-text="Нет данных"
        height="500"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div>
              <h3 class="sell-list__subtitle">Список продаж</h3>
              <el-table :data="props.row.sells" :border="false">
                <el-table-column label="Название" prop="name" width="400" />
                <el-table-column label="Тип товара" prop="typeName" />
                <el-table-column label="Цена Закупа" prop="productPrice" />
                <el-table-column label="Проданная цена" prop="sellPrice" />
                <el-table-column label="Количество" prop="count" />
                <el-table-column label="Измерение">
                  <template #default="scope">
                    {{ scope.row.isWeightProduct ? 'кг' : 'шт' }}
                  </template>
                </el-table-column>
                <el-table-column label="Общая цена" prop="totalPrice" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="ID" prop="id" width="60" align="center" />
        <el-table-column label="Название" prop="name" />
        <el-table-column label="Дата покупки">
          <template #default="scope">
            {{ moment(scope.row.createdAt).format('DD.MM.YYYY HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="Общая сумма" prop="totalPrice" />
        <el-table-column align="right" width="100">
          <template #default="scope">
            <el-popconfirm
              width="220"
              confirm-button-text="Удалить"
              cancel-button-text="Нет, cпасибо"
              title="Вы точно хотите удалить запись ?"
              @confirm="deleteClientSell(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" :loading="deleteClientSellLoading">
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
        :total="clientSellsWithDateRange.length"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
//@ts-ignore
import * as api from '@/api/requests.ts'
import { ElNotification } from 'element-plus'
import type { ClientSell } from '@/types'
import moment from 'moment'
const clientSellLoading = ref(false)
const clientSells = ref<ClientSell[]>([])

const clientSellsWithDateRange = computed(() => {
  if (date.value?.[0] && date.value?.[1]) {
    const startDate = moment(date.value[0])
    const endDate = moment(date.value[1])
    return clientSells.value.filter((clientSell) =>
      moment(clientSell.createdAt).isBetween(startDate, endDate)
    )
  }
  return clientSells.value
})

const clientSellsWithPagination = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  const clientSellsCopy = [...clientSellsWithDateRange.value]
  return clientSellsCopy.slice(start, end)
})

const fetchClientSells = async () => {
  try {
    clientSellLoading.value = true
    const response = await api.getClientSells()
    clientSells.value = response.result.clientSells
  } catch (e) {
    console.error((e as any).message)
    ElNotification({
      title: 'Ошибка!',
      message: 'Не удалось удалить тип',
      type: 'error'
    })
  } finally {
    clientSellLoading.value = false
  }
}

const pageSize = ref(10)
const currentPage = ref(1)
const date = ref('')

const dateChangeListener = () => {
  currentPage.value = 1
}

const deleteClientSellLoading = ref(false)

const deleteClientSell = async (id: number) => {
  try {
    deleteClientSellLoading.value = true
    await api.deleteClientSell(id)
    ElNotification({
      title: 'Успех!',
      message: 'Тип успешно удален',
      type: 'success'
    })
    clientSells.value = clientSells.value.filter((clientSell) => clientSell.id !== id)
  } catch (e) {
    console.error((e as any).message)
    ElNotification({
      title: 'Ошибка!',
      message: 'Не удалось удалить запись',
      type: 'error'
    })
  } finally {
    deleteClientSellLoading.value = false
  }
}

onMounted(() => {
  fetchClientSells()
})
</script>
<style lang="scss" scoped>
.sell-list {
  padding: rem(35);

  &__wrapper {
    background: #fff;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-radius: rem(5);
    padding: rem(15);
  }

  &__title {
    margin-bottom: rem(35);
  }

  &__subtitle {
    margin: rem(15);
  }

  &__filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(20);
    margin-bottom: rem(20);
  }

  &__date {
    flex: 0 0 rem(500);

    .el-date-editor {
      width: 100%;
    }
  }
}

.pagination {
  margin-top: rem(20);
}
</style>
