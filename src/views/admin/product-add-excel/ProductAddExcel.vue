<template>
  <div class="product-add-excel">
    <div class="product-add-excel__body">
      <h1 class="product-add-excel__title">Добавление продуктов через Excel</h1>

      <el-upload
        v-model:file-list="fileList"
        class="product-add-excel__upload"
        :auto-upload="false"
        :on-change="handleChange"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">Перетащите файл<em> или выберите файл</em></div>
        <template #tip>
          <div class="el-upload__tip">Файл должен быть .excel формата</div>
        </template>
      </el-upload>
      <div class="product-add-excel__wrapper" v-if="tableData.length > 0">
        <el-button
          type="success"
          class="product-add-excel__upload-button"
          :loading="uploadProductLoading"
          @click="uploadProduct"
        >
          Загрузить данные в базу
        </el-button>
      </div>
      <el-table :data="pagedTableData">
        <el-table-column label="№" width="50">
          <template #default="{ $index }">{{ (page - 1) * pageSize + $index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="barcode" label="Штрих код" />
        <el-table-column prop="name" label="Наименование" width="350" />
        <el-table-column prop="price" label="Цена закупа" />
        <el-table-column prop="wholesalePrice" label="Оптовая цена" />
        <el-table-column prop="retailPrice" label="Розничная цена" />
        <el-table-column prop="typesId" label="Тип продукта" />
        <el-table-column label="Измерение" >
          <template #default="scope">
            {{  scope.row.isWeightProduct ? 'кг' : 'шт' }}
            </template>
          </el-table-column>
        <el-table-column align="right" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteProduct(row.id)">
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        class="product-add-excel__pagination"
        v-if="tableData.length > 0"
        layout="prev, pager, next"
        @current-change="setPage"
        :page-size="pageSize"
        :total="tableData.length"
      >
      </el-pagination>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { read, utils } from 'xlsx'
import type { Product } from '@/types'
import * as api from '@/api/requests'
import { ElNotification } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

const fileList = ref<UploadUserFile[]>([])
const tableData = ref<Product[]>([])

const page = ref(1)
const pageSize = ref(10)

const pagedTableData = computed(() => {
  {
    if (!tableData.value || tableData.value.length === 0) return []
    return tableData.value.slice(
      pageSize.value * page.value - pageSize.value,
      pageSize.value * page.value
    )
  }
})

const setPage = (val) => (page.value = val)

const handleChange: UploadProps['onChange'] = (uploadFile) => {
  const reader = new FileReader()

  reader.onload = function () {
    const arrayBuffer = this.result,
      array = new Uint8Array(arrayBuffer),
      binaryString = String.fromCharCode.apply(null, array)

    const workbook = read(binaryString, {
      type: 'binary'
    })

    const first_sheet_name = workbook.SheetNames[0]

    const worksheet = workbook.Sheets[first_sheet_name]

    tableData.value = utils
      .sheet_to_json(worksheet, {
        raw: true
      })
      .map((tableItem) => ({
        id: uuidv4(),
        ...tableItem
      }))
    fileList.value = []
  }
  reader.readAsArrayBuffer(uploadFile.raw)
}

const uploadProductLoading = ref(false)

const uploadProduct = async () => {
  try {
    uploadProductLoading.value = true
    const mappedTableData = tableData.value.map((tableItem) => ({
      barcode: tableItem.barcode,
      name: tableItem.name,
      price: tableItem.price,
      wholesalePrice: tableItem.wholesalePrice,
      retailPrice: tableItem.retailPrice,
      typesId: tableItem.typesId
    }))

    await api.uploadProducts(mappedTableData)
    ElNotification({
      title: 'Успех',
      message: 'Продукты успешно загрузились',
      type: 'success'
    })
    tableData.value = []
  } catch (e) {
    console.error(e.message)
    ElNotification({
      title: 'Ошибка!',
      message: e.message || 'Не удалось создать тип',
      type: 'error'
    })
  } finally {
    uploadProductLoading.value = false
  }
}

const deleteProduct = (id: string) => {
  tableData.value = tableData.value.filter((tableItem) => tableItem.id !== id)
}
</script>
<style lang="scss" scoped>
.product-add-excel {
  padding: rem(25) rem(25);

  &__body {
    background: #fff;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-radius: rem(5);
    padding: rem(15);
  }

  &__upload {
    margin-top: rem(30);
  }

  &__upload-button {
    margin: rem(15) 0;
    margin-bottom: rem(15);
  }

  &__wrapper {
    display: flex;
    justify-content: flex-end;
  }
  &__pagination {
    margin-top: rem(20);
  }
}
</style>
