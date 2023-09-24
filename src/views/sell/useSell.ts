import { ref, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import moment from 'moment'
import { ElNotification, ElMessageBox } from 'element-plus'
import type { Product, Sell, Type } from '@/types'
//@ts-ignore
import * as api from '@/api/requests.ts'
//@ts-ignore
import pdfMake from 'pdfmake/build/pdfmake'
//@ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs

const createDefaultSell = (id: number, isManual: boolean) => ({
  id,
  name: '',
  count: 1,
  sellPrice: '0',
  productPrice: '',
  typeName: '',
  isWeightProduct: false,
  isManual: isManual,
  remainedCount: 0
})

export const useSell = (products: Ref<Product[]>, types: Ref<Type[]>) => {
  const isWholesellPrice = ref(false)
  const sellList = ref<Sell[]>([])

  const addSellFromBd = () =>
    sellList.value.push(createDefaultSell(sellList.value.length + 1, false))

  const addSellManual = () =>
    sellList.value.push(createDefaultSell(sellList.value.length + 1, true))

  const selectGood = (productName: string, sellId: number) => {
    const currentSellIndex = sellList.value.findIndex((sellItem) => sellItem.id === sellId)
    const foundProduct = products.value.find((product) => product.name === productName)
    sellList.value[currentSellIndex].name = foundProduct?.name || ''
    sellList.value[currentSellIndex].isWeightProduct = foundProduct?.isWeightProduct || false
    sellList.value[currentSellIndex].productPrice = foundProduct?.price || ''
    sellList.value[currentSellIndex].sellPrice = isWholesellPrice.value
      ? foundProduct?.wholesalePrice!
      : foundProduct?.retailPrice!
    sellList.value[currentSellIndex].typeName =
      types.value.find((type) => type.id === foundProduct?.typesId)?.name || ''
    sellList.value[currentSellIndex].remainedCount = foundProduct?.count || 0
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

  const deleteSell = (id: number) =>
    (sellList.value = sellList.value.filter((sellItem) => sellItem.id !== id))

  const calculateTotalPrice = (count?: string | number, price?: string | number) => {
    if (count && price) {
      return (+count * +price).toFixed(2)
    }
    return '0'
  }

  const totalPrice = computed(() => {
    return sellList.value.reduce((sum, good) => {
      if (good.count && good.sellPrice) {
        const price = (+good.count * +good.sellPrice).toFixed(2)
        return sum + +price
      }
      return 0
    }, 0)
  })

  const restrictContinue = computed(
    () =>
      !sellList.value.every((sellItem) => sellItem.name && sellItem.sellPrice && sellItem.count > 0)
  )

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
            sellPrice: sellItem.sellPrice,
            productPrice: currentProduct.price,
            count: sellItem.count.toString(),
            typeName: types.value.find((type) => type.id === currentProduct.typesId)?.name || '',
            isWeightProduct: currentProduct.isWeightProduct,
            clientSellsId: clientSellId
          })
        } else {
          api.createSell({
            name: sellItem.name,
            sellPrice: sellItem.sellPrice,
            productPrice: sellItem.sellPrice,
            count: sellItem.count.toString(),
            typeName: '',
            isWeightProduct: sellItem.isWeightProduct,
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

  const barcode = ref('')

  const addFromBarcode = (barcodeVal: string) => {
    const foundProduct = products.value.find((product) => product.barcode === barcodeVal)
    if (foundProduct) {
      addSellFromBd()
      const lastElementIndex = sellList.value.length - 1
      selectGood(foundProduct.name, sellList.value[lastElementIndex].id)
      nextTick(() => {
        barcode.value = ''
      })
    } else {
      ElMessageBox.alert('Продукт по штрих коду не найден', 'Внимание!!!', {
        confirmButtonText: 'OK',
        autofocus: false
      })
    }
  }

  return {
    isWholesellPrice,
    sellList,
    addSellFromBd,
    addSellManual,
    barcode,
    selectGood,
    changePrices,
    calculateTotalPrice,
    totalPrice,
    deleteSell,
    restrictContinue,
    completeSellLoading,
    completeSell,
    completeAndPrint,
    addFromBarcode
  }
}
