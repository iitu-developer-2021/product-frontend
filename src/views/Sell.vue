<template>
  <div class="sell">
    <div class="sell__wrapper">
      <h1 class="sell__title">Продать товар</h1>

      <div class="sell__top">
        <div class="sell__switch">
          <el-switch
            v-model="isCheap"
            @change="switchChanged"
            active-text="Оптом"
            inactive-text="Розницу"
            class="dialog__switch"
          />
        </div>
        <div class="sell__add">
          <el-button type="primary" size="large" @click="addGoodManual">
            Добавить товар вручную
          </el-button>
          <el-button type="primary" size="large" @click="addGoodBd">Добавить товар c бд</el-button>
          <el-button type="danger" size="large" @click="resetGoods">Очистить все</el-button>
        </div>
      </div>
      <div class="sell__content">
        <el-table
          v-loading="productsLoading || typeLoading"
          :data="goods"
          empty-text="Добавьте товар, чтобы начать"
        >
          <el-table-column prop="id" label="№" width="50"> </el-table-column>
          <el-table-column label="Название товара">
            <template #default="scope">
              <el-select
                v-if="!scope.row.isManual"
                class="select"
                placeholder="Выберите товар"
                v-model="scope.row.name"
                @change="selectGood($event, scope.row.id)"
                filterable
              >
                <el-option
                  v-for="item in products"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
              <el-input v-else placeholder="Введите товар" v-model="scope.row.name" />
            </template>
          </el-table-column>

          <el-table-column label="Количество" width="180">
            <template #default="scope">
              <el-input-number v-model="scope.row.count" :min="1" :max="1000" />
            </template>
          </el-table-column>

          <el-table-column label="Цена за единицу">
            <template #default="scope">
              <el-input
                v-maska
                data-maska="#############"
                placeholder="Введите цену"
                v-model="scope.row.sellPrice"
              />
            </template>
          </el-table-column>

          <el-table-column label="Общая цена" width="150" align="right">
            <template #default="scope">
              {{
                scope.row.count && scope.row.sellPrice
                  ? (+scope.row.count * +scope.row.sellPrice).toFixed(2)
                  : '0'
              }}
            </template>
          </el-table-column>
          <el-table-column align="right" width="100">
            <template #default="scope">
              <el-popconfirm
                width="220"
                confirm-button-text="Удалить"
                cancel-button-text="Нет, cпасибо"
                title="Вы точно хотите удалить тип ?"
                @confirm="deleteSell(scope.row.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger"> Удалить </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="bottom" v-if="goods.length > 0">
          <p class="total"><strong>Итоговая стоимость:</strong> {{ totalPrice }} тенге</p>
          <div class="bottom__actions">
            <el-button
              type="success"
              @click="completeListener"
              :loading="completeLoading"
              :disabled="isCompletedButtonDisabled"
            >
              Завершить
            </el-button>
            <el-button type="success" :disabled="isCompletedButtonDisabled" @click="saveAndPrint">
              Завершить и печатать
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import type { Sell, Product } from '@/types'
import { vMaska } from 'maska'
import { ElNotification } from 'element-plus'
import moment from 'moment'
import type { Type } from '@/types'
//@ts-ignore
import pdfMake from 'pdfmake/build/pdfmake'
//@ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs

//@ts-ignore
import * as api from '@/api/requests.ts'

const isCheap = ref(false)
const goods = ref<Sell[]>([])

const addGoodBd = () => {
  goods.value.push({
    id: goods.value.length + 1,
    name: '',
    count: 1,
    sellPrice: '0',
    productPrice: '',
    totalPrice: '',
    typeName: '',
    isWeightProduct: false,
    isManual: false
  })
}

const addGoodManual = () => {
  goods.value.push({
    id: goods.value.length + 1,
    name: '',
    count: 1,
    sellPrice: '0',
    productPrice: '',
    totalPrice: '',
    typeName: '',
    isWeightProduct: false,
    isManual: true
  })
}

const selectGood = (value: string, goodId: number) => {
  const foundProduct = products.value.find((product) => product.name === value)
  if (foundProduct) {
    const currentGoodIndex = goods.value.findIndex((good) => good.id === goodId)
    if (currentGoodIndex !== -1) {
      if (isCheap.value) {
        goods.value[currentGoodIndex].sellPrice = foundProduct.wholesalePrice
      } else {
        goods.value[currentGoodIndex].sellPrice = foundProduct.retailPrice
      }
    }
  }
}

const resetGoods = () => {
  goods.value = []
}

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

const deleteSell = (id: number) => {
  goods.value = goods.value.filter((good) => good.id !== id)
}

const switchChanged = (isCheap: boolean) => {
  goods.value = goods.value.map((good) => {
    const currentProduct = products.value.find((product) => product.name === good.name)
    if (currentProduct) {
      return {
        ...good,
        sellPrice: isCheap ? currentProduct.wholesalePrice : currentProduct.retailPrice
      }
    } else {
      return good
    }
  })
}

const totalPrice = computed(() => {
  return goods.value.reduce((sum, good) => {
    if (good.count && good.sellPrice) {
      const price = (+good.count * +good.sellPrice).toFixed(2)
      return sum + +price
    }
    return 0
  }, 0)
})

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

const completeLoading = ref(false)
const completeListener = async () => {
  try {
    completeLoading.value = true
    const name = `Продажа ${moment().format('DD-MM-YYYY HH:mm:ss')}`
    const response = await api.createClientSell(name, totalPrice.value.toString())
    const clientSellId = response.result.clientSell.id
    const goodsPromise = goods.value.map((good) => {
      const currentProduct = products.value.find((product) => product.name === good.name)
      if (currentProduct) {
        return api.createSell({
          name: good.name,
          sellPrice: good.sellPrice,
          productPrice: currentProduct.price,
          count: good.count.toString(),
          totalPrice: (good.count * +good.sellPrice).toString(),
          typeName: types.value.find((type) => type.id === currentProduct.typesId)?.name || '',
          isWeightProduct: currentProduct.isWeightProduct,
          clientSellsId: clientSellId
        })
      } else {
        api.createSell({
          name: good.name,
          sellPrice: good.sellPrice,
          productPrice: good.sellPrice,
          count: good.count.toString(),
          totalPrice: (good.count * +good.sellPrice).toString(),
          typeName: '',
          isWeightProduct: false,
          clientSellsId: clientSellId
        })
      }
    })

    await Promise.all(goodsPromise)
    ElNotification({
      title: 'Успех!',
      message: 'Данные успешно сохранены',
      type: 'success'
    })
    goods.value = []
  } catch (e) {
    console.error((e as any).message)
    ElNotification({
      title: 'Ошибка!',
      message: 'Не удалось завершить покупку',
      type: 'error'
    })
  } finally {
    completeLoading.value = false
  }
}

const isCompletedButtonDisabled = computed(
  () => !goods.value.every((good) => good.name && good.sellPrice && good.count > 0)
)

const saveAndPrint = () => {
  const mappedGoods = goods.value.map((good, index) => [
    (index + 1).toString(),
    good.name.toString(),
    good.count.toString(),
    (+good.sellPrice).toFixed(2).toString(),
    (good.count * +good.sellPrice).toFixed(2).toString()
  ])
  const docDefinition = {
    content: [
      { text: 'Расходная накладная', style: 'header' },
      {
        style: 'check',
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [['№', 'Товар', 'Количество', 'Цена', 'Сумма'], ...mappedGoods]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    }
  }
  pdfMake.createPdf(docDefinition).print()
}

onMounted(() => {
  fetchProducts()
  fetchTypes()
})
</script>
<style lang="scss" scoped>
.sell {
  padding: rem(25) rem(25);

  &__top {
    display: flex;
    justify-content: space-between;
  }

  &__title {
    margin-bottom: rem(35);
  }

  &__wrapper {
    background: #fff;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-radius: rem(5);
    padding: rem(15);
  }

  &__add {
    display: flex;
    justify-content: flex-end;
  }

  &__content {
    margin-top: rem(40);
  }
}

.select {
  width: 100%;
}

.total {
  font-size: rem(18);
}

.bottom {
  margin-top: rem(35);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__actions {
    margin-left: auto;
  }
}
</style>
