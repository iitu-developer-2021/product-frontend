<template>
  <div class="sell">
    <div class="sell__body">
      <h1 class="sell__title">Продать товар</h1>

      <div class="sell__actions">
        <el-switch
          v-model="isWholesellPrice"
          @change="changePrices"
          active-text="Оптом"
          inactive-text="Розницу"
          class="sell__switch"
        />

        <el-button type="primary" size="large" @click="addSellManual" class="sell__button-add">
          Добавить товар вручную
        </el-button>
        <el-button type="primary" size="large" @click="addSellFromBd">
          Добавить товар c бд
        </el-button>
        <el-button type="danger" size="large" @click="sellList = []">Очистить все</el-button>
      </div>

      <el-input
        v-model="barcode"
        size="large"
        @keydown.enter.stop="addFromBarcode(barcode)"
        placeholder="Введите или отсканируйте штрих код"
        class="sell__barcode"
        v-maska
        data-maska="#####################"
        ref="barcodeRef"
      />

      <el-table
        v-loading="productsLoading || typesLoading"
        :data="sellList"
        empty-text="Добавьте товар, чтобы начать"
      >
        <el-table-column prop="id" label="№" width="50"> </el-table-column>
        <el-table-column label="Название товара">
          <template #default="scope">
            <el-select
              v-if="!scope.row.isManual"
              class="sell__select"
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
            <el-input-number v-model="scope.row.count" :min="0" :max="100000" />
          </template>
        </el-table-column>

        <el-table-column label="Цена">
          <template #default="scope">
            <el-input
              v-maska
              data-maska="#############"
              placeholder="Введите цену"
              v-model="scope.row.sellPrice"
            />
          </template>
        </el-table-column>

        <el-table-column label="Измерение" width="150" align="center">
          <template #default="scope">
            <div v-if="!scope.row.isManual">
              {{ scope.row.name ? (scope.row.isWeightProduct ? 'кг' : 'шт') : '-' }}
            </div>
            <el-switch
              v-else
              v-model="scope.row.isWeightProduct"
              active-text="кг"
              inactive-text="шт"
            />
          </template>
        </el-table-column>

        <el-table-column label="Сумма" width="150" align="right">
          <template #default="scope">
            {{ calculateTotalPrice(scope.row.count, scope.row.sellPrice) }}
          </template>
        </el-table-column>

        <el-table-column label="В складе" width="150" align="right">
          <template #default="scope">
            {{
              scope.row.name
                ? scope.row.remainedCount + ' ' + (scope.row.isWeightProduct ? 'кг' : 'шт')
                : '-'
            }}
          </template>
        </el-table-column>

        <el-table-column align="right" width="100">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deleteSell(scope.row.id)">
              Удалить
            </el-button>
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
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { vMaska } from 'maska'
//@ts-ignore
import { useSell } from './useSell.ts'
//@ts-ignore
import { useTypes } from '@/composables/useTypes.ts'
//@ts-ignore
import { useProducts } from '@/composables/useProducts.ts'

const { fetchTypes, types, typesLoading } = useTypes()
const { fetchProducts, products, productsLoading } = useProducts()
const money = ref('')

const {
  isWholesellPrice,
  sellList,
  addSellFromBd,
  addSellManual,
  barcode,
  selectGood,
  changePrices,
  calculateTotalPrice,
  deleteSell,
  totalPrice,
  restrictContinue,
  completeSell,
  completeSellLoading,
  completeAndPrint,
  addFromBarcode,
  barcodeRef
} = useSell(products, types)

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
  }

  &__switch {
    flex: 1;
  }

  &__barcode {
    margin: rem(35) 0;
  }

  &__select {
    width: 100%;
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
