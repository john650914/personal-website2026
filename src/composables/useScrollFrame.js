import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 全站共用的捲動節流器。
 *
 * 所有跟捲動有關的效果（選單高亮、背景視差、太空船飛出）都掛在這裡，
 * 整個頁面只有一組 scroll 監聽 + 一個 requestAnimationFrame。
 *
 * 舊站的做法是每個效果各自 $(window).scroll(...)，而且完全沒有節流：
 * 視差外掛一個、太空船一個、選單高亮又一個，捲動一次會觸發多次
 * 讀取 offset() 與寫入 style，造成反覆的 layout 計算。
 */

/** @type {Set<(state: {scrollY: number, viewportHeight: number}) => void>} */
const subscribers = new Set()

let frameId = 0
let bound = false

function flush() {
  frameId = 0
  const state = {
    scrollY: window.scrollY,
    viewportHeight: window.innerHeight,
  }
  for (const callback of subscribers) callback(state)
}

function schedule() {
  // 同一個 frame 內重複觸發只排一次
  if (!frameId) frameId = requestAnimationFrame(flush)
}

function bind() {
  if (bound) return
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  bound = true
}

function unbind() {
  if (!bound || subscribers.size > 0) return
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (frameId) cancelAnimationFrame(frameId)
  frameId = 0
  bound = false
}

/**
 * 在每個捲動 frame 執行 callback。元件卸載時自動解除訂閱。
 * @param {(state: {scrollY: number, viewportHeight: number}) => void} callback
 */
export function useScrollFrame(callback) {
  onMounted(() => {
    subscribers.add(callback)
    bind()
    schedule()
  })

  onBeforeUnmount(() => {
    subscribers.delete(callback)
    unbind()
  })
}

/** 外部主動要求重算（例如 lightbox 開關改變了頁面高度） */
export function requestScrollFrame() {
  schedule()
}
