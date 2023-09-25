<template>
  <div class="login">
    <div class="login__wrapper">
      <form class="login-form">
        <h1 class="login-form__title">Авторизация</h1>
        <el-input placeholder="Введите логин" class="login-form__login" v-model="login" />
        <el-input
          placeholder="Введите пароль"
          type="password"
          class="login-form__password"
          v-model="password"
          @keydown.enter="signIn(login, password)"
          show-password
        />
        <el-button
          class="login-form__auth"
          @click="signIn(login, password)"
          :loading="signInLoading"
        >
          Авторизоваться
        </el-button>
      </form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
//@ts-ignore
import * as api from '@/api/requests.ts'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const login = ref('')
const password = ref('')

const signInLoading = ref(false)
const signIn = async (login: string, password: string) => {
  try {
    signInLoading.value = true
    const response = await api.signIn(login, password)
    localStorage.setItem('token', response.result.token)
    router.push('/admin')
  } catch (e) {
    console.log((e as any).response?.data?.message)
    ElNotification({
      title: 'Ошибка!',
      message: (e as any).response?.data?.message || 'Не удалось авторизоваться',
      type: 'error'
    })
  } finally {
    signInLoading.value = false
  }
}
</script>
<style lang="scss" scoped>
.login {
  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
}

.login-form {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  padding: rem(20);
  max-width: rem(400);

  &__title {
    margin-bottom: rem(25);
  }

  &__login,
  &__password {
    margin-bottom: rem(15);
  }

  &__auth {
    width: 100%;
  }
}
</style>
