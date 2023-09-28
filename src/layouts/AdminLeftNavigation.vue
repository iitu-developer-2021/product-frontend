<template>
  <aside class="main-sidebar" :class="{ 'main-sidebar--active': showSidebarMenu }">
    <nav class="main-sidebar__nav main-nav">
      <el-tooltip
        :disabled="showSidebarMenu"
        content="Открыть меню"
        placement="right"
        :show-after="150"
      >
        <button class="main-nav__toggler" @click="toggleSidebar">
          <template v-if="showSidebarMenu">
            <div class="main-nav__back">
              <div class="main-nav__logo">
                <svg-icons name="just-logo" width="45px" height="45px" />
                <p class="main-nav__logo-text"><span>Мистер</span> сухофрукт</p>
              </div>
              <svg-icons name="arrow-left" width="15px" height="15px" color="#BDBDCC" />
            </div>
          </template>

          <svg-icons name="menu-burger" width="25px" height="25px" v-else />
        </button>
      </el-tooltip>

      <ul class="main-nav__list nav-list">
        <el-tooltip
          v-for="leftNavigationItem in leftNavigationItems"
          :key="leftNavigationItem.name"
          :content="leftNavigationItem.name"
          :disabled="showSidebarMenu"
          placement="right"
          :show-after="150"
        >
          <li
            class="nav-list__item"
            :class="{
              'nav-list__item--active': leftNavigationItem.routeName === $route.name
            }"
            v-if="leftNavigationItem.show"
            @click="leftNavigationItem.clickHandler"
            @keydown.enter="leftNavigationItem.clickHandler"
            :tabindex="0"
          >
            <svg-icons
              :name="leftNavigationItem.icon"
              :width="leftNavigationItem.iconSize"
              :height="leftNavigationItem.iconSize"
              class="nav-list__icon"
            />
            <div class="nav-list__title">
              {{ leftNavigationItem.name }}
            </div>
          </li>
        </el-tooltip>
      </ul>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcons from '../components/SvgIcons.vue'

const props = defineProps({
  showSidebarMenu: Boolean
})

const emit = defineEmits(['toggleShowSidebar'])

const toggleSidebar = () => {
  emit('toggleShowSidebar', !props.showSidebarMenu)
}

const router = useRouter()

const leftNavigationItems = computed(() => [
  {
    name: 'Продать',
    icon: 'sell',
    iconSize: '25px',
    show: true,
    routeName: 'Sell',
    clickHandler: () => {
      router.push({
        name: 'Sell'
      })
    }
  },
  {
    name: 'Типы товаров',
    icon: 'types',
    iconSize: '25px',
    show: true,
    routeName: 'Types',
    clickHandler: () => {
      router.push({
        name: 'Types'
      })
    }
  },
  {
    name: 'Продажа',
    icon: 'sell-list',
    iconSize: '25px',
    show: true,
    routeName: 'SellList',
    clickHandler: () => {
      router.push({
        name: 'SellList'
      })
    }
  },
  {
    name: 'Продукты',
    icon: 'products',
    iconSize: '25px',
    show: true,
    routeName: 'Products',
    clickHandler: () => {
      router.push({
        name: 'Products'
      })
    }
  }
])
</script>
<style lang="scss" scoped>
.main-sidebar {
  position: fixed;
  width: rem(65);
  height: 100%;
  background: var(--colors-bg-primary);
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: rgba(0, 0, 0, 0.16) 0 rem(1) rem(4);
  border-right: rem(1) solid transparent;
  z-index: 2;

  &--active {
    width: rem(300);
  }

  &__nav {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}

.main-nav {
  &__toggler {
    width: 100%;
    height: rem(50);
    transition: 0.3s all ease 0s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__logo-text {
    font-weight: bold;
    color: #000;
    margin-left: rem(10);
    font-size: rem(16);

    span {
      color: green;
    }
  }

  &__back {
    display: flex;
    align-items: center;
    padding: 0 rem(16);
    justify-content: space-between;
  }

  &__list {
    height: calc(100vh - 115px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__bottom {
    height: rem(65);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: rem(5);
    border-top: rem(1) solid var(--colors-border-default);
  }

  &__useful-link {
    margin-left: rem(5);
  }
}

.nav-list {
  &__item {
    display: flex;
    align-items: center;
    flex: 1;
    height: rem(50);
    cursor: pointer;

    &:hover:not(.nav-list__item--active) {
      background: rgba(0, 0, 0, 0.04);
    }

    &--active {
      background: var(--colors-action-accent-default);
    }
  }

  &__icon {
    flex: 0 0 rem(40);
    margin-left: rem(12);
  }

  &__title {
    padding: 0 rem(12);
    font-size: rem(16);
    color: var(--colors-label-primary);
    font-weight: 400;
    line-height: rem(24);
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
