import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useScrollFrame } from './useScrollFrame'

/**
 * 依捲動位置判斷目前所在的 section。
 *
 * 做法：在視窗上方設一條「判定線」，由上往下找最後一個頂端已經越過
 * 判定線的 section。這個判斷是單調的 —— 往下捲只會前進、往上捲只會
 * 後退，不會在兩個 section 之間來回跳。
 *
 * 為什麼不用 IntersectionObserver 的 intersectionRatio：
 * ratio 是「交集面積 ÷ 目標自身面積」，所以同樣的重疊量，矮的 section
 * 算出來的 ratio 會比高的大。四個 section 高度差很多，比 ratio 等於
 * 系統性偏袒矮的那個，交界處就會互搶。
 *
 * 效能上每個 frame 只做純算術：section 的文件座標在量測階段先存好，
 * 捲動時不再讀取 DOM，不會觸發 layout。
 *
 * @param {string[]} ids section 的 id，必須依頁面由上到下的順序
 * @param {object}   options
 * @param {number}   options.offset    固定導覽的高度
 * @param {number}   options.lineRatio 判定線位置（視窗高度的比例）
 * @returns {{ activeId: import('vue').Ref<string> }}
 */
export function useScrollSpy(ids, { offset = 0, lineRatio = 0.3 } = {}) {
  const activeId = ref(ids[0] ?? '')

  /** @type {{ id: string, top: number }[]} */
  let positions = []
  let resizeObserver = null

  // 量測每個 section 在「文件」中的頂端位置（不是視窗相對位置），
  // 這樣捲動時就不必再碰 DOM
  const measure = () => {
    const scrollY = window.scrollY
    positions = ids
      .map((id) => {
        const el = document.getElementById(id)
        if (!el) return null
        return { id, top: el.getBoundingClientRect().top + scrollY }
      })
      .filter((item) => item !== null)
  }

  const update = ({ scrollY, viewportHeight }) => {
    if (!positions.length) return

    const line = scrollY + offset + viewportHeight * lineRatio

    let current = positions[0].id
    for (const { id, top } of positions) {
      if (top <= line) current = id
      else break
    }

    // 捲到頁面底部時，最後一個 section 可能永遠碰不到判定線
    const atBottom =
      scrollY + viewportHeight >= document.documentElement.scrollHeight - 2
    if (atBottom) current = positions[positions.length - 1].id

    if (activeId.value !== current) activeId.value = current
  }

  useScrollFrame(update)

  onMounted(() => {
    measure()

    // 內容高度會變（字型載入、圖片載入、lightbox 開關），重新量測
    resizeObserver = new ResizeObserver(() => {
      measure()
      update({ scrollY: window.scrollY, viewportHeight: window.innerHeight })
    })
    resizeObserver.observe(document.body)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
  })

  return { activeId }
}
