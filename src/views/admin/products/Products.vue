<template>
  <div class="products">
    <div class="products__wrapper">
      <div class="products__top">
        <h1 class="types__title">Список Продуктов</h1>
        <el-button type="primary" @click="addProductListener">Добавить продукт</el-button>
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
        <el-table-column prop="barcode" label="Штрих код" />
        <el-table-column prop="name" label="Название товара" width="400" />
        <el-table-column prop="price" label="Цена закупа" />
        <el-table-column prop="wholesalePrice" label="Оптовая цена" />
        <el-table-column prop="retailPrice" label="Розничная цена" />
        <el-table-column prop="isWeightProduct" label="Остаток">
          <template #default="scope">
            {{ scope.row.count }}{{ scope.row.isWeightProduct ? 'кг' : 'шт' }}
          </template>
        </el-table-column>
        <el-table-column align="right" width="220">
          <template #default="scope">
            <el-button size="small" @click="editProductListener(scope.row)">
              Редактировать
            </el-button>
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
        <el-input placeholder="Штрих код" v-model="modalForm.barcode" class="dialog__input" />
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

        <el-select
          placeholder="Тип товара"
          v-model="modalForm.typesId"
          filterable
          class="dialog__input"
        >
          <el-option v-for="item in types" :key="item.name" :label="item.name" :value="item.id" />
        </el-select>

        <div class="bottom">
          <el-input-number
            v-model="modalForm.count"
            :min="0"
            :max="100000"
            placeholder="Количество"
          />
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
              saveListener(
                modalForm.name,
                +modalForm.wholesalePrice!,
                +modalForm.retailPrice!,
                +modalForm.price!,
                modalForm.isWeightProduct!,
                modalForm.typesId!,
                modalForm.barcode,
                modalForm.count
              )
            "
            :loading="createProductLoading"
            :disabled="
              !modalForm.name ||
              !modalForm.wholesalePrice ||
              !modalForm.retailPrice ||
              !modalForm.price ||
              !modalForm.typesId ||
              !modalForm.barcode ||
              !modalForm.count
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
import { ElNotification } from 'element-plus'
import { vMaska } from 'maska'
import { useTypes } from '@/composables/useTypes'
import { useProducts } from '@/composables/useProducts'

const route = useRoute()
const pageSize = ref(10)
const currentPage = ref(route.query.currentPage ? +route.query.currentPage : 1)

const filter = reactive<{ search: string; range: string[]; type: string }>({
  search: '',
  range: [],
  type: ''
})

const { products, fetchProducts } = useProducts()
const { types, fetchTypes } = useTypes()

const paginateProduct = (products: Product[]): Product[] => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  return products.slice(start, end)
}

const searchProduct = (products: Product[], search: string): Product[] => {
  if (search) {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(search.toLowerCase())
    )
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

const modalForm = reactive({
  name: '',
  wholesalePrice: '',
  retailPrice: '',
  price: '',
  isWeightProduct: false,
  typesId: null as number | null,
  barcode: '',
  count: 0
})

const showModal = ref(false)

const clearForm = () => {
  modalForm.name = ''
  modalForm.wholesalePrice = ''
  modalForm.retailPrice = ''
  modalForm.price = ''
  modalForm.isWeightProduct = false
  modalForm.typesId = null
  modalForm.barcode = ''
  modalForm.count = 0
}

const createProductLoading = ref(false)

const createProduct = async (
  name: string,
  wholesalePrice: number,
  retailPrice: number,
  price: number,
  isWeightProduct: boolean,
  typesId: number,
  barcode: string,
  count: number
) => {
  try {
    createProductLoading.value = true
    const response = await api.createProduct(
      name,
      wholesalePrice,
      retailPrice,
      price,
      isWeightProduct,
      typesId,
      barcode,
      count
    )
    ElNotification({
      title: 'Успех!',
      message: 'Товар успешно создан',
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

let modalType: 'add' | 'edit' = 'add'
let tempEditProduct: Product | null = null

const editProductListener = (product: Product) => {
  tempEditProduct = product
  console.log(product)
  modalForm.name = product.name
  modalForm.isWeightProduct = product.isWeightProduct
  modalForm.price = product.price.toString()
  modalForm.retailPrice = product.retailPrice.toString()
  modalForm.wholesalePrice = product.wholesalePrice.toString()
  modalForm.typesId = product.typesId
  modalForm.count = product.count
  modalForm.barcode = product.barcode || ''
  modalType = 'edit'
  showModal.value = true
}

const addProductListener = () => {
  tempEditProduct = null
  clearForm()
  modalType = 'add'
  showModal.value = true
}

const saveListener = (
  name: string,
  wholesalePrice: number,
  retailPrice: number,
  price: number,
  isWeightProduct: boolean,
  typesId: number,
  barcode: string,
  count: number
) => {
  if (modalType === 'add') {
    createProduct(
      name,
      wholesalePrice,
      retailPrice,
      price,
      isWeightProduct,
      typesId,
      barcode,
      count
    )
  } else {
    editProduct(name, wholesalePrice, retailPrice, price, isWeightProduct, typesId, barcode, count)
  }
}

const editProductLoading = ref(false)

const editProduct = async (
  name: string,
  wholesalePrice: number,
  retailPrice: number,
  price: number,
  isWeightProduct: boolean,
  typesId: number,
  barcode: string,
  count: number
) => {
  try {
    editProductLoading.value = true
    const response = await api.editProduct(
      tempEditProduct!.id,
      name,
      wholesalePrice,
      retailPrice,
      price,
      isWeightProduct,
      typesId,
      barcode,
      count
    )
    ElNotification({
      title: 'Успех!',
      message: 'Продукт успешно отредактирован',
      type: 'success'
    })
    const currentProduct = products.value.findIndex(
      (type) => type.id === response.result.product.id
    )
    products.value[currentProduct].name = name
    products.value[currentProduct].wholesalePrice = wholesalePrice
    products.value[currentProduct].retailPrice = retailPrice
    products.value[currentProduct].price = price
    products.value[currentProduct].isWeightProduct = isWeightProduct
    products.value[currentProduct].typesId = typesId
    products.value[currentProduct].barcode = barcode
    products.value[currentProduct].count = count
    clearForm()
    showModal.value = false
    tempEditProduct = null
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
    width: 100%;
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
