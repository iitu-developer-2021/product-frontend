<template>
  <div class="products">
    <div class="products__wrapper">
      <div class="products__top">
        <h1 class="types__title">Список Продуктов</h1>
        <el-button type="primary" @click="showModal = true">Добавить продукт</el-button>
      </div>
      <div class="filters">
        <el-input class="filters__input" placeholder="Поиск" v-model="filter.search" />
        <el-select
          class="filters__select"
          v-model="filter.type"
          placeholder="Выберите товар"
          filterable
          clearable
        >
          <el-option v-for="type in types" :key="type.name" :label="type.name" :value="type.id" />
        </el-select>
      </div>

      <el-table
        :data="paginateProduct(filteredProducts)"
        style="width: 100%"
        height="500"
        empty-text="Таблица пустая"
      >
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
          <template #default="scope">
            <el-button size="small">Редактировать</el-button>
            <el-popconfirm
              width="220"
              confirm-button-text="Удалить"
              cancel-button-text="Нет, cпасибо"
              title="Вы точно хотите удалить продукт ?"
              @confirm="deleteProduct(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" :loading="deleteProductLoading">
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
        @current-change="$router.push({ path: $route.fullPath, query: { currentPage: $event } })"
        background
        layout="total, prev, pager, next"
        :total="filteredProducts.length"
      />

      <el-dialog v-model="showModal" align-center class="dialog" @closed="clearForm">
        <h1 class="dialog__title">Добавление нового продукта</h1>
        <el-input placeholder="Наименование" v-model="modalForm.name" class="dialog__input" />

        <el-input
          v-maska
          data-maska="#############"
          placeholder="Оптовая цена"
          v-model="modalForm.wholesalePrice"
          class="dialog__input"
        />

        <el-input
          v-maska
          data-maska="#############"
          placeholder="Розничная цена"
          v-model="modalForm.retailPrice"
          class="dialog__input"
        />

        <el-input
          v-maska
          data-maska="#############"
          placeholder="Цена закупа"
          v-model="modalForm.price"
          class="dialog__input"
        />

        <div class="bottom">
          <el-select
            class="bottom__select"
            placeholder="Тип товара"
            v-model="modalForm.typesId"
            filterable
          >
            <el-option v-for="item in types" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>

          <el-switch
            v-model="modalForm.isWeightProduct"
            active-text="кг"
            inactive-text="шт"
            class="dialog__switch"
          />
        </div>
        <div class="dialog__actions">
          <el-button type="info">Отменить</el-button>
          <el-button
            type="primary"
            @click="
              createProduct(
                modalForm.name,
                modalForm.wholesalePrice!,
                modalForm.retailPrice!,
                modalForm.price!,
                modalForm.isWeightProduct!,
                modalForm.typesId!
              )
            "
            :loading="createProductLoading"
            :disabled="
              !modalForm.name ||
              !modalForm.wholesalePrice ||
              !modalForm.retailPrice ||
              !modalForm.price ||
              !modalForm.typesId
            "
          >
            Cохранить
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
//@ts-ignore
import * as api from '@/api/requests.ts'
import type { Product } from '@/types'
import { onMounted, reactive, computed } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Type } from '@/types'
import { ElNotification } from 'element-plus'
import { vMaska } from 'maska'

const tempProducts = ref<Product[]>([])
const products = ref<Product[]>([])
const productsLoading = ref(false)

const route = useRoute()
const pageSize = ref(10)
const currentPage = ref(route.query.currentPage ? +route.query.currentPage : 1)

const filter = reactive<{ search: string; range: string[]; type: string }>({
  search: '',
  range: [],
  type: ''
})

const paginateProduct = (products: Product[]): Product[] => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  return products.slice(start, end)
}

const searchProduct = (products: Product[], search: string): Product[] => {
  if (search) {
    return products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
  }
  return products
}

const typedProduct = (products: Product[], typeId: string): Product[] => {
  if (typeId) {
    return products.filter((product) => product.typesId === +typeId)
  }
  return products
}

const filteredProducts = computed(() => {
  const searchedProducts = searchProduct(products.value, filter.search)
  return typedProduct(searchedProducts, filter.type)
})

const fetchProducts = async () => {
  try {
    productsLoading.value = true
    const response = await api.fetchProducts()
    products.value = response.result.products
    tempProducts.value = response.result.products
  } catch (e) {
    console.error((e as any).message)
  } finally {
    productsLoading.value = false
  }
}

const types = ref<Type[]>([])
const typeLoading = ref(false)

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

const modalForm = reactive({
  name: '',
  wholesalePrice: null,
  retailPrice: null,
  price: null,
  isWeightProduct: false,
  typesId: null
})

const showModal = ref(false)

const clearForm = () => {
  modalForm.name = ''
  modalForm.wholesalePrice = null
  modalForm.retailPrice = null
  modalForm.price = null
  modalForm.isWeightProduct = false
  modalForm.typesId = null
}

const createProductLoading = ref(false)

const createProduct = async (
  name: string,
  wholesalePrice: string,
  retailPrice: string,
  price: string,
  isWeightProduct: boolean,
  typesId: number
) => {
  try {
    createProductLoading.value = true
    const response = await api.createProduct(
      name,
      wholesalePrice,
      retailPrice,
      price,
      isWeightProduct,
      typesId
    )
    ElNotification({
      title: 'Успех!',
      message: 'Тип успешно создан',
      type: 'success'
    })
    products.value.push(response.result.product)
    clearForm()
    showModal.value = false
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
    products.value = products.value.filter((type) => type.id !== id)
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

onMounted(() => {
  fetchProducts()
  fetchTypes()
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
  &__input {
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

.pagination {
  margin-top: rem(20);
}

.filters {
  display: flex;
  align-items: center;
  gap: rem(15);
  margin-bottom: rem(25);

  &__select,
  &__input {
    flex: 0 1 rem(300);
  }

  &__button {
    margin-left: auto;
  }
}

.bottom {
  display: flex;
  align-items: center;
  gap: rem(10);

  &__select {
    flex: 0 1 rem(300);
  }
}
</style>
