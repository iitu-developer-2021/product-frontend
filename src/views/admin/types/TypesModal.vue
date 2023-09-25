<template>
  <el-dialog v-bind="$attrs" align-center>
    <div class="types-modal">
      <h1 class="types-modal__title">{{ title }}</h1>
      <el-input
        placeholder="Введите название типа"
        class="dialog__input"
        :model-value="typeName"
        @update:modelValue="$emit('update:typeName', $event)"
      />
      <div class="types-modal__actions">
        <el-button type="info" @click="$emit('cancel')">Отменить</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!typeName"
          @click="$emit('confirm', typeName)"
        >
          Cохранить
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
type Props = {
  loading?: boolean
  title?: string
  typeName?: string
}

type Emits = {
  (e: 'confirm', typeName: string): void
  (e: 'cancel'): void
  (e: 'update:typeName', value: string): void
}

withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<Emits>()
</script>
<style lang="scss" scoped>
.types-modal {
  &__title {
    margin-bottom: rem(15);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: rem(15);
  }
}
</style>
