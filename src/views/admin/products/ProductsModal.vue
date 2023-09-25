<template>
  <el-dialog class="product-modal" v-bind="$attrs" align-center>
    <h1 class="product-modal__title">{{ title }}</h1>

    <el-input
      placeholder="Наименование"
      :model-value="modalForm.name"
      @update:model-value="updateForm('name', $event)"
      class="product-modal__input"
    />

    <el-input
      v-maska
      data-maska="#####################"
      placeholder="Штрих код"
      :model-value="modalForm.barcode"
      @update:model-value="updateForm('barcode', $event)"
      class="product-modal__input"
    />

    <el-input
      v-maska
      data-maska="#############"
      placeholder="Оптовая цена"
      :model-value="modalForm.wholesalePrice"
      @update:model-value="updateForm('wholesalePrice', $event)"
      class="product-modal__input"
    />

    <el-input
      v-maska
      data-maska="#############"
      placeholder="Розничная цена"
      :model-value="modalForm.retailPrice"
      @update:model-value="updateForm('retailPrice', $event)"
      class="product-modal__input"
    />

    <el-input
      v-maska
      data-maska="#############"
      placeholder="Цена закупа"
      :model-value="modalForm.price"
      @update:model-value="updateForm('price', $event)"
      class="product-modal__input"
    />

    <el-select
      placeholder="Тип товара"
      :model-value="modalForm.typesId"
      @update:model-value="updateForm('typesId', $event)"
      filterable
      class="product-modal__select"
    >
      <el-option v-for="item in types" :key="item.name" :label="item.name" :value="item.id" />
    </el-select>

    <div class="bottom">
      <el-input-number
        :model-value="modalForm.count"
        @update:model-value="updateForm('count', $event)"
        :min="0"
        :max="100000"
        placeholder="Количество"
      />

      <el-switch
        :model-value="modalForm.isWeightProduct"
        @update:model-value="updateForm('isWeightProduct', $event)"
        active-text="кг"
        inactive-text="шт"
        class="bottom__switch"
      />
    </div>

    <div class="product-modal__actions">
      <el-button type="info" @click="$emit('cancel')">Отменить</el-button>
      <el-button
        type="primary"
        @click="$emit('confirm')"
        :loading="loading"
        :disabled="disableConfirmButton"
      >
        Cохранить
      </el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import type { Product } from '@/types'
import { useTypes } from '@/composables/useTypes'
import { vMaska } from 'maska'

export type ProductForm = Omit<
  Product,
  'id' | 'wholesalePrice' | 'retailPrice' | 'price' | 'typesId'
> & {
  wholesalePrice: string
  retailPrice: string
  price: string
  typesId: number | null
}

type Props = {
  title: string
  modalForm: ProductForm
  loading?: boolean
}

type Emits = {
  (e: 'update:modalForm', modalForm: ProductForm): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const disableConfirmButton = computed(
  () =>
    !props.modalForm.name ||
    !props.modalForm.wholesalePrice ||
    !props.modalForm.retailPrice ||
    !props.modalForm.price ||
    !props.modalForm.typesId ||
    !props.modalForm.barcode ||
    !props.modalForm.count
)

const updateForm = (key: string, value: string) => {
  emit('update:modalForm', {
    ...props.modalForm,
    [key]: value
  })
}

const { types, fetchTypes } = useTypes()

onMounted(() => {
  fetchTypes()
})
</script>
<style lang="scss" scoped>
.product-modal {
  &__title {
    margin-bottom: rem(25);
  }

  &__input,
  &__select {
    margin-bottom: rem(16);
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: rem(10);
  }
}

.bottom {
  display: flex;
  align-items: center;
  gap: rem(10);
  margin-bottom: rem(15);

  &__select {
    flex: 0 1 rem(300);
  }
}
</style>
