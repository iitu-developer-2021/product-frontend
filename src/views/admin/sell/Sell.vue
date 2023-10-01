<template>
  <div class="sell">
    <div class="sell__body">
      <h1 class="sell__title">Продать товар</h1>
      <div class="sell__sticky">
        <div class="sell__actions">
          <el-switch
            v-model="isWholesellPrice"
            @change="changePrices"
            active-text="Оптом"
            inactive-text="Розницу"
            class="sell__switch"
          />

          <el-button
            type="primary"
            size="large"
            class="sell__button-add"
            @click="addSellManual"
            :disabled="typesLoading || productsLoading"
          >
            Добавить товар вручную
          </el-button>

          <el-button
            type="primary"
            size="large"
            @click="addSellFromBd"
            :disabled="typesLoading || productsLoading"
          >
            Добавить товар c бд
          </el-button>
          <el-button type="danger" size="large">Очистить все</el-button>
        </div>

        <el-input
          ref="barcodeRef"
          v-model="barcode"
          @keydown.enter.stop="addFromBarcode(barcode)"
          size="large"
          placeholder="Введите или отсканируйте штрих код"
          class="sell__barcode"
          v-maska
          data-maska="#####################"
        />
      </div>
      <el-table empty-text="Добавьте товар, чтобы начать" :data="sellList">
        <el-table-column label="№" width="50">
          <template #default="{ $index }"> {{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="Название товара">
          <template #default="{ row }">
            <el-select
              v-if="!row.isManual"
              class="sell__select"
              placeholder="Выберите товар"
              v-model="row.productId"
              @change="selectGood(row.productId, row.id)"
              filterable
            >
              <el-option
                v-for="item in products"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-input v-else placeholder="Введите товар" v-model="row.name" />
          </template>
        </el-table-column>

        <el-table-column label="Количество" width="180">
          <template #default="{ row }">
            <el-input-number :min="0" :max="100000" v-model="row.count" />
          </template>
        </el-table-column>

        <el-table-column label="Цена">
          <template #default="{ row }">
            <el-input
              v-maska
              data-maska="#############"
              placeholder="Введите цену"
              v-model="row.sellPrice"
            />
          </template>
        </el-table-column>

        <el-table-column label="Измерение" width="150" align="center">
          <template #default="{ row }">
            <div v-if="!row.isManual">
              {{ row.name ? (row.isWeightProduct ? 'кг' : 'шт') : '-' }}
            </div>
            <el-switch v-else v-model="row.isWeightProduct" active-text="кг" inactive-text="шт" />
          </template>
        </el-table-column>

        <el-table-column label="Сумма" width="150" align="right">
          <template #default="{ row }">
            {{ calculateTotalPrice(row.count, row.sellPrice) }}
          </template>
        </el-table-column>

        <el-table-column align="right" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteSell(row.id)"> Удалить </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom" v-if="sellList.length > 0">
        <p class="bottom__total"><strong>Итоговая стоимость:</strong> {{ totalPrice }} тенге</p>
        <div class="bottom__actions">
          <el-button
            type="success"
            @click="completeSell"
            :loading="completeSellLoading"
            :disabled="restrictContinue"
          >
            Завершить
          </el-button>
          <el-button type="success" :disabled="restrictContinue" @click="completeAndPrint">
            Завершить и печатать
          </el-button>
        </div>
      </div>

      <div class="calculator" v-if="sellList.length > 0">
        <el-input
          v-model="money"
          placeholder="Внесенная сумма"
          v-maska
          data-maska="#####################"
          class="calculator__field"
        />

        <div class="calculator__result">
          <strong>Сдача:</strong>
          {{ money && +money - +totalPrice > 0 ? +money - +totalPrice : 0 }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from 'vue'
//@ts-ignore
import { v4 as uuidv4 } from 'uuid'
import { vMaska } from 'maska'
import { useTypes } from '@/composables/useTypes'
import { useProducts } from '@/composables/useProducts'
import * as api from '@/api/requests'
import moment from 'moment'
import { ElMessageBox, ElNotification } from 'element-plus'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs

type SellItem = {
  id: string
  productId: number | null
  name: string
  count: number
  sellPrice: string | number
  productPrice: number
  typeName: string
  isWeightProduct: boolean
  isManual: boolean
  barcode: string
}

const createSellItem = (isManual: boolean): SellItem => ({
  id: uuidv4(),
  productId: null,
  name: '',
  count: 1,
  sellPrice: '',
  productPrice: 0,
  typeName: '',
  isWeightProduct: false,
  isManual: isManual,
  barcode: ''
})

const money = ref('')
const barcode = ref('')
const barcodeRef = ref()
const isWholesellPrice = ref(false)
const sellList = ref<SellItem[]>([])

const addSellFromBd = () => {
  const createdSellItem = createSellItem(false)
  sellList.value.push(createdSellItem)
  nextTick(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
  return createdSellItem.id
}

const addSellManual = () => {
  const createdSellItem = createSellItem(true)
  sellList.value.push(createdSellItem)
  nextTick(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
  return createdSellItem.id
}

const deleteSell = (id: string) =>
  (sellList.value = sellList.value.filter((sellItem) => sellItem.id !== id))

const selectGood = (productId: number, sellId: string) => {
  const currentSellIndex = sellList.value.findIndex((sellItem) => sellItem.id === sellId)
  const foundProduct = products.value.find((product) => product.id === productId)
  if (foundProduct) {
    sellList.value[currentSellIndex].name = foundProduct.name
    sellList.value[currentSellIndex].isWeightProduct = foundProduct.isWeightProduct
    sellList.value[currentSellIndex].productPrice = foundProduct.price
    sellList.value[currentSellIndex].sellPrice = isWholesellPrice.value
      ? foundProduct.wholesalePrice
      : foundProduct.retailPrice
    sellList.value[currentSellIndex].barcode = foundProduct.barcode || ''
    sellList.value[currentSellIndex].typeName =
      types.value.find((type) => type.id === foundProduct?.typesId)?.name || ''
    sellList.value[currentSellIndex].productId = foundProduct.id
  }
}

const calculateTotalPrice = (count: string | number, price: string | number) => {
  if (count && price) {
    return (+count * +price).toFixed(2)
  }
  return '0'
}

const changePrices = () => {
  sellList.value = sellList.value.map((sell) => {
    const currentProduct = products.value.find((product) => product.name === sell.name)
    if (currentProduct) {
      return {
        ...sell,
        sellPrice: isWholesellPrice.value
          ? currentProduct.wholesalePrice
          : currentProduct.retailPrice
      }
    } else {
      return sell
    }
  })
}

const totalPrice = computed(() => {
  return sellList.value.reduce((sum, good) => {
    if (good.count && good.sellPrice) {
      const price = (+good.count * +good.sellPrice).toFixed(2)
      return sum + +price
    }
    return sum
  }, 0)
})

const restrictContinue = computed(
  () =>
    !sellList.value.every((sellItem) => sellItem.name && sellItem.sellPrice && sellItem.count > 0)
)

const addFromBarcode = (barcodeVal: string) => {
  if(!barcodeVal) return
  
  const foundProduct = products.value.find(
    (product) =>{
      console.log( product.barcode === barcodeVal, product.barcode === `0${barcodeVal}`)
     return  product.barcode === barcodeVal || product.barcode === `0${barcodeVal}`
    }
  )

  if (foundProduct) {
    const foundSellIndex = sellList.value.findIndex(
      (sellItem) => sellItem.barcode === barcodeVal || sellItem.barcode === `0${barcodeVal}`
    )

    if (foundSellIndex !== -1) {
      sellList.value[foundSellIndex].count = sellList.value[foundSellIndex].count + 1
    } else {
      const createdSellId = addSellFromBd()
      selectGood(foundProduct.id, createdSellId)
    }

    barcode.value = ''
    barcodeRef.value.focus()
  } else {
    ElMessageBox.alert('Продукт по штрих коду не найден', 'Внимание!!!', {
      confirmButtonText: 'OK',
      autofocus: false
    })
  }
}

const completeSellLoading = ref(false)
const completeSell = async () => {
  try {
    completeSellLoading.value = true
    const name = `Продажа ${moment().format('DD-MM-YYYY HH:mm:ss')}`
    const response = await api.createClientSell(name, totalPrice.value.toFixed(2).toString())
    const clientSellId = response.result.clientSell.id
    const goodsPromise = sellList.value.map((sellItem) => {
      const currentProduct = products.value.find((product) => product.name === sellItem.name)
      if (currentProduct) {
        return api.createSell({
          name: sellItem.name,
          sellPrice: +sellItem.sellPrice,
          productPrice: +currentProduct.price,
          count: sellItem.count,
          typeName: types.value.find((type) => type.id === currentProduct.typesId)?.name || '',
          isWeightProduct: currentProduct.isWeightProduct,
          clientSellsId: clientSellId,
          barcode: sellItem.barcode || '',
          productId: sellItem.productId as number
        })
      } else {
        api.createSell({
          name: sellItem.name,
          sellPrice: +sellItem.sellPrice,
          productPrice: +sellItem.sellPrice,
          count: sellItem.count,
          typeName: '',
          isWeightProduct: sellItem.isWeightProduct,
          clientSellsId: clientSellId,
          barcode: sellItem.barcode || '',
          productId: sellItem.productId as number
        })
      }
    })

    await Promise.all(goodsPromise)
    ElNotification({
      title: 'Успех!',
      message: 'Данные успешно сохранены',
      type: 'success'
    })
    sellList.value = []
  } catch (e) {
    console.error((e as any).message)
    ElNotification({
      title: 'Ошибка!',
      message: 'Не удалось завершить покупку',
      type: 'error'
    })
  } finally {
    completeSellLoading.value = false
  }
}

const completeAndPrint = () => {
  const mappedGoods = sellList.value.map((sellItem, index) => [
    (index + 1).toString(),
    sellItem.name.toString(),
    `${sellItem.count.toString()} ${sellItem.isWeightProduct ? 'кг' : 'шт'}`,
    (+sellItem.sellPrice).toFixed(2).toString(),
    (sellItem.count * +sellItem.sellPrice).toFixed(2).toString()
  ])
  const docDefinition = {
    content: [
      { text: 'Расходная накладная ' + moment().format('DD.MM.YYYY HH:mm'), style: 'header' },
      { text: 'Магазин: Рай-Шатыр', style: 'text' },
      {
        text: 'Адрес: Республика Казахстан, Костанайская область, Складская, база ОРТ, дом 4а',
        style: 'text'
      },
      {
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [['№', 'Товар', 'Количество', 'Цена', 'Сумма'], ...mappedGoods]
        }
      },
      {
        text: 'Итог: ' + totalPrice.value.toFixed(2).toString(),
        style: 'total'
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
      },
      text: {
        fontSize: 12,
        color: 'black',
        margin: [0, 0, 0, 7]
      },
      total: {
        bold: true,
        fontSize: 13,
        color: 'black',
        margin: [0, 15, 0, 0]
      }
    }
  }
  completeSell()
  pdfMake.createPdf(docDefinition as any).print()
}

const { fetchTypes, types, typesLoading } = useTypes()
const { fetchProducts, products, productsLoading } = useProducts()

onMounted(() => {
  fetchTypes()
  fetchProducts()
})
</script>
<style lang="scss" scoped>
.sell {
  padding: rem(25) rem(25);

  &__body {
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

  &__actions {
    display: flex;
    align-items: center;
    gap: rem(15);
    margin-top: rem(25);
  }

  &__switch {
    flex: 1;
  }

  &__barcode {
    margin: rem(15) 0;
  }

  &__select {
    width: 100%;
  }

  &__sticky {
    position: sticky;
    top: rem(0);
    z-index: 100;
    background: #fff;
    padding: rem(15);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
    margin-bottom: rem(15);
  }
}

.bottom {
  margin-top: rem(35);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__total {
    font-size: rem(18);
  }

  &__actions {
    margin-left: auto;
  }
}

.calculator {
  margin-top: rem(20);
  display: flex;
  align-items: center;
  gap: rem(20);

  &__field {
    flex: 0 0 rem(150);
  }
}
</style>
