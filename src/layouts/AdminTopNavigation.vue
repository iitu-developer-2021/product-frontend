<template>
  <transition name="slide-fade">
    <header
      class="top-navigation"
      v-if="showHeader"
      :class="{ 'top-navigation--scrolled': showBoxShadow }"
    >
      <div class="top-navigation__actions top-actions">
        <div class="top-actions__user">
          <el-tooltip placement="bottom" content="Меню" :show-after="150">
            <el-dropdown trigger="click">
              <el-button type="primary" size="small" class="top-actions__avatar" icon-type round>
                NA
              </el-button>

              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">Выйти</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>
        </div>
      </div>
    </header>
  </transition>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useScroll } from '@/composables/useScroll'

const router = useRouter()
const { showBoxShadow, showHeader } = useScroll()

const logout = () => {
  localStorage.removeItem('token')
  router.push({
    name: 'Login'
  })
}
</script>
<style lang="scss" scoped>
.top-navigation {
  padding: 0 rem(28);
  height: rem(48);
  background-color: var(--colors-bg-primary);
  display: flex;
  align-items: center;
  gap: rem(20);
  position: fixed;
  top: 0;
  left: rem(65);
  right: 0;
  z-index: 100;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: rem(1) solid var(--colors-border-default);

  &--scrolled {
    box-shadow: 0 rem(1) rem(4) rgba(0, 0, 0, 0.16);
  }

  &__search {
    display: flex;
    align-items: center;
  }

  &__input {
    width: rem(200);

    :deep(.el-input__inner) {
      font-size: rem(16);
    }
  }

  &__button {
    width: rem(64);
  }

  &__refresh {
    border-radius: 0 rem(4) rem(4) 0;
    margin: 0;
    padding: 0;
    width: rem(32);
  }

  &__actions {
    margin-left: auto;
  }
}

.top-nav {
  margin-left: rem(20);
  $self: &;

  &__list {
    display: flex;
    align-items: center;
    gap: rem(22);
    height: 100%;
  }

  &__item {
    display: flex;
    align-items: center;
    height: rem(48);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    transition: 0.3s all ease 0s;
    color: var(--colors-decorative-label-light-grey);
    font-weight: 600;
    cursor: pointer;
    font-size: rem(14);
    white-space: nowrap;
    position: relative;
    height: 100%;

    &::after {
      opacity: 0;
      content: '';
      height: rem(4);
      background: var(--colors-bg-default);
      border-radius: rem(4) rem(4) 0 0;
      position: absolute;
      bottom: 0;
      left: rem(-2);
      width: calc(100% + 4px);
    }

    &--active.router-link-exact-active {
      color: var(--colors-label-primary);

      &::after {
        opacity: 1;
      }
    }

    &:hover:not(#{$self}__link--active) {
      color: var(--colors-label-primary);
    }
  }
}

.top-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    display: block;
    width: rem(1);
    height: rem(28);
    background: var(--colors-border-default);
    margin: 0 rem(13);
    order: 1;
  }

  &__badge {
    margin-right: rem(13);

    :deep(.el-badge__content) {
      top: rem(8);
      right: rem(20);
    }
  }

  &__fullscreen {
    order: 2;
    margin: 0;
  }

  &__user {
    position: relative;
    order: 3;
    margin-left: rem(5);
  }

  &__avatar {
    cursor: pointer;
    width: rem(35);
    height: rem(35);
  }

  &__menu {
    position: absolute;
    top: rem(48);
    right: 0;
  }
}

.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(rem(-30));
}
</style>
