import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 量測元素在「文件」中的頂端位置，寫進該元素的 --anchor。
 *
 * 用途：讓視差效果能用舊站同一條公式
 *     位移 = (元素頂端 - 捲動量) × 係數
 * 也就是「元素頂端剛好到視窗頂端時位移為 0」。
 * 舊站是在 parallax 外掛裡存成 firstTop 變數；這裡改成 CSS 變數，
 * 位移本身就能在 CSS 的 calc() 裡算完。
 *
 * --anchor 會被子元素繼承，所以實際做位移的可以是內層元素。
 *
 * @param {() => (HTMLElement | null)[]} getElements
 */
export function useParallaxAnchor(getElements) {
  let observer = null

  const measure = () => {
    const scrollY = window.scrollY

    for (const el of getElements()) {
      if (!el) continue
      const top = el.getBoundingClientRect().top + scrollY
      el.style.setProperty('--anchor', `${Math.round(top)}px`)
    }
  }

  onMounted(() => {
    measure()

    // 頁面高度會變（字型載入、圖片載入），位置要重新量
    observer = new ResizeObserver(measure)
    observer.observe(document.body)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })
}
