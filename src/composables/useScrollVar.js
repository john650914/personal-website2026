import { onBeforeUnmount, onMounted } from 'vue'
import { requestScrollFrame, useScrollFrame } from './useScrollFrame'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * 把捲動量寫進 :root 的 --scroll-y。
 *
 * 這是全站視差的唯一 JS 介面：JS 只負責「餵一個數字」，
 * 所有位移計算都留在 CSS 的 calc() 裡。
 * 好處是每個效果的係數可以直接在 SCSS 調，不用回頭改 JS。
 *
 * 為什麼不用 CSS scroll-driven animation（animation-timeline: scroll()）：
 * Firefox 目前仍未正式支援，整段效果會直接失效。
 */
export function useScrollVar() {
  const reduced = window.matchMedia(REDUCED_MOTION)

  let last = -1

  const write = (value) => {
    if (value === last) return
    last = value
    document.documentElement.style.setProperty('--scroll-y', `${value}px`)
  }

  useScrollFrame(({ scrollY }) => {
    // 視差是「跟著捲動的位移」而不是自動播放的動畫，所以
    // _reset.scss 裡那段 prefers-reduced-motion 規則管不到它。
    // 這裡把捲動量固定成 0，背景、太空船、隕石、衛星、太空人
    // 的視差就會一起停住 —— 一個開關關掉全部。
    write(reduced.matches ? 0 : scrollY)
  })

  // 使用者在系統設定裡切換偏好時立刻反映，不必重新整理
  onMounted(() => {
    reduced.addEventListener('change', requestScrollFrame)
  })

  onBeforeUnmount(() => {
    reduced.removeEventListener('change', requestScrollFrame)
  })
}
