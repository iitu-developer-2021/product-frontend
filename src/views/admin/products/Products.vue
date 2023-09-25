<template>
  <div class="products">
    <div class="products__body">
      <div class="products__top">
        <h1 class="products__titles">Список типов товара</h1>
        <el-button type="primary" @click="showAddModal = true"> Добавить тип </el-button>
      </div>
      <div class="products__filters filters">
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

      <h3 class="totalCount">
        Общая сумма за выбранный продукт: <strong>{{ totalPrice }}</strong>
      </h3>

      <el-table :data="paginateProduct(filteredProducts)" height="500" empty-text="Таблица пустая">
        <el-table-column prop="id" label="ID" width="50" />
        <el-table-column prop="barcode" label="Штрих код" />
        <el-table-column prop="name" label="Название товара" width="300" />
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
            <el-button size="small" @click="setEditValues(scope.row)"> Редактировать </el-button>
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

      <products-modal
        title="Добавление нового продукта"
        v-model="showAddModal"
        v-model:modal-form="addForm"
        @cancel="(addForm = initDefaultForm()), (showAddModal = false)"
        @confirm="
          createProduct({
            typesId: addForm.typesId!,
            name: addForm.name,
            wholesalePrice: +addForm.wholesalePrice,
            retailPrice: +addForm.retailPrice,
            price: +addForm.price,
            isWeightProduct: addForm.isWeightProduct,
            count: addForm.count,
            barcode: addForm.barcode
          })
        "
        :loading="createProductLoading"
      />

      <products-modal
        title="Редактирование  продукта"
        v-model="showEditModal"
        v-model:modal-form="editForm"
        @cancel="(editForm = initDefaultFormWithId()), (showEditModal = false)"
        @confirm="
          editProduct({
            id: editForm.id as number,
            typesId: editForm.typesId!,
            name: editForm.name,
            wholesalePrice: +editForm.wholesalePrice,
            retailPrice: +editForm.retailPrice,
            price: +editForm.price,
            isWeightProduct: editForm.isWeightProduct,
            count: editForm.count,
            barcode: editForm.barcode
          })
        "
        :loading="editProductLoading"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTypes } from '@/composables/useTypes'
import { useProducts } from '@/composables/useProducts'
import type { Product } from '@/types'
import type { ProductForm } from './ProductsModal.vue'
import { useProductsCrud } from './useProductsCrud'

import ProductsModal from './ProductsModal.vue'

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

const {
  createProduct,
  createProductLoading,
  deleteProduct,
  deleteProductLoading,
  editProduct,
  editProductLoading
} = useProductsCrud({
  successCreateCallback: (newProduct) => {
    products.value.push(newProduct)
    addForm.value = initDefaultForm()
    showAddModal.value = false
  },
  successDeleteCallback: (id: number) => {
    products.value = products.value.filter((type) => type.id !== id)
  },
  successEditCallback: (newProduct) => {
    const currentProduct = products.value.findIndex((type) => type.id === newProduct.id)
    products.value[currentProduct].name = newProduct.name
    products.value[currentProduct].wholesalePrice = newProduct.wholesalePrice
    products.value[currentProduct].retailPrice = newProduct.retailPrice
    products.value[currentProduct].price = newProduct.price
    products.value[currentProduct].isWeightProduct = newProduct.isWeightProduct
    products.value[currentProduct].typesId = newProduct.typesId
    products.value[currentProduct].barcode = newProduct.barcode
    products.value[currentProduct].count = newProduct.count
    addForm.value = initDefaultForm()
    showEditModal.value = false
  }
})

onMounted(() => {
  fetchProducts()
  fetchTypes
})

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

const initDefaultForm = () => ({
  name: '',
  wholesalePrice: '',
  retailPrice: '',
  price: '',
  isWeightProduct: false,
  typesId: null,
  barcode: '',
  count: 0
})

const initDefaultFormWithId = () => ({
  ...initDefaultForm(),
  id: null
})

const showAddModal = ref(false)
const addForm = ref<ProductForm>(initDefaultForm())

const showEditModal = ref(false)
const editForm = ref<ProductForm & { id: number | null }>(initDefaultFormWithId())

const setEditValues = (product: Product) => {
  editForm.value.id = product.id
  editForm.value.name = product.name
  editForm.value.wholesalePrice = product.wholesalePrice.toString()
  editForm.value.retailPrice = product.retailPrice.toString()
  editForm.value.price = product.price.toString()
  editForm.value.isWeightProduct = product.isWeightProduct
  editForm.value.typesId = product.typesId
  editForm.value.barcode = product.barcode
  editForm.value.count = product.count
  showEditModal.value = true
}

const totalPrice = computed(() =>
  filteredProducts.value.reduce((sum: number, product: Product) => {
    return sum + +product.price * +product.count
  }, 0)
)
</script>
<style lang="scss" scoped>
.products {
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

.totalCount {
  margin-bottom: rem(15);
}
</style>
