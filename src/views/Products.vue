<template>
  <div class="products">
    <div class="products__wrapper">
      <div class="products__top">
        <h1 class="types__title">Список Продуктов</h1>
        <el-button type="primary" @click="showModal = true">Добавить продукт</el-button>
      </div>
      <el-table :data="products" style="width: 100%" height="550" empty-text="Таблица пустая">
        <el-table-column prop="id" label="ID" width="50" />
        <el-table-column prop="name" label="Название товара" width="400" />
        <el-table-column prop="price" label="Цена закупа" />
        <el-table-column prop="wholesalePrice" label="Оптовая цена" />
        <el-table-column prop="retailPrice" label="Розничная цена" />
        <el-table-column prop="isWeightProduct" label="Измерение">
          <template #default="scope">
            {{ scope.row.isWeightProduct ? 'кг' : 'шт' }}
          </template>
        </el-table-column>
        <el-table-column align="right" width="220">
          <template #default>
            <el-button size="small">Редактировать</el-button>
            <el-button size="small" type="danger"> Удалить </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="showModal" align-center class="dialog">
        <h1 class="dialog__title">Добавление нового продукта</h1>
        <el-input placeholder="Наименование" v-model="modalForm.name" class="dialog__input" />
        <el-input
          placeholder="Оптовая цена"
          v-model="modalForm.wholesalePrice"
          class="dialog__input"
        />
        <el-input
          placeholder="Розничная цена"
          v-model="modalForm.retailPrice"
          class="dialog__input"
        />
        <el-input placeholder="Цена закупа" v-model="modalForm.price" class="dialog__input" />
        <el-switch
          v-model="modalForm.isWeightProduct"
          active-text="кг"
          inactive-text="шт"
          class="dialog__switch"
        />
        <div class="dialog__actions">
          <el-button type="info">Отменить</el-button>
          <el-button type="primary"> Cохранить </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
//@ts-ignore
import * as api from '@/api/requests.ts'
import type { Product } from '@/types'
import { onMounted, reactive } from 'vue'
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

const modalForm = reactive({
  name: '',
  wholesalePrice: null,
  retailPrice: null,
  price: null,
  isWeightProduct: false
})

const showModal = ref(false)

onMounted(() => {
  fetchProducts()
})
</script>
<style lang="scss" scoped>
.products {
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
  &__input,
  &__switch {
    margin-bottom: rem(16);
  }

  &__title {
    margin-bottom: rem(25);
  }
}

.dialog {
  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: rem(10);
  }
}
</style>
