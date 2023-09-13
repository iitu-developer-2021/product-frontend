<template>
  <div class="main-layout">
    <admin-left-navigation
      :show-sidebar-menu="showSidebarMenu"
      @toggle-show-sidebar="showSidebarMenu = $event"
    />
    <div class="main-content" :class="{ 'main-content--active': showSidebarMenu }">
      <admin-top />
      <main class="main-content__body" ref="mainContentBodyRef">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AdminLeftNavigation from './AdminLeftNavigation.vue'
import AdminTop from './AdminTopNavigation.vue'
const showSidebarMenu = ref(false)
const mainContentBodyRef = ref()
</script>

<style lang="scss" scoped>
.main-layout {
  position: relative;
}

.main-content {
  position: absolute;
  width: calc(100% - 65px);
  min-height: 100vh;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  left: rem(65);
  background: #f8f7fa;

  &--active {
    width: calc(100% - 300px);
    left: rem(301);
  }

  &__body {
    background-color: var(--colors-bg-main);
    height: calc(100vh - 48px);
    overflow: auto;
  }
}

.slide-x-leave-active,
.slide-x-enter-active {
  transition: transform 0.2s;
}
.slide-x-enter-from,
.slide-x-leave-to {
  transform: translateX(-100%);
}

.slide-x-enter-to,
.slide-x-leave-from {
  transform: translateX(0);
}
</style>
