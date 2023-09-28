import { onMounted, onUnmounted, ref } from 'vue'

export const useScroll = () => {
  const showHeader = ref(true)
  const showBoxShadow = ref(false)

  const onScroll = () => {
    const top = window.pageYOffset || document.documentElement.scrollTop

    if (top >= 5 && top <= 60) {
      showBoxShadow.value = true
    } else if (top > 60) {
      showHeader.value = false
      showBoxShadow.value = false
    } else {
      showHeader.value = true
      showBoxShadow.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return {
    showHeader,
    showBoxShadow
  }
}
