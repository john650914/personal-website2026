import { onBeforeUnmount, onMounted, ref } from 'vue'

// 任一軸位移達此距離才決定是水平拖曳還是垂直捲動
const AXIS_LOCK_DISTANCE = 10
// 放開時水平位移達此距離才切換
export const SWIPE_THRESHOLD = 50
// 水平位移需大於垂直位移的倍數，避免斜向捲動誤觸發
const DOMINANCE_RATIO = 1.5
// 邊界（無法再切換）時的跟手阻尼
const EDGE_RESISTANCE = 0.3
// 彈回動畫時間，需與 CSS 的 transform 過渡一致
const RETURN_DURATION = 200
const TOUCH_ACTION = 'pan-y pinch-zoom'

/**
 * 左右滑動手勢（touch / mouse / pen 統一走 Pointer Events）。
 *
 * 只負責判定手勢與提供跟手位移，實際切換交給呼叫端的 onSwipe，
 * 所以邊界、預載、轉場都能沿用既有流程。
 *
 * 刻意不用 setPointerCapture：捕獲期間 click 會被重新導向到捕獲元素，
 * 「點空白處關閉」這類 @click.self 會失效。改把 move / up 掛在 window。
 *
 * touch-action 設為 pan-y pinch-zoom：垂直捲動與雙指縮放交給瀏覽器，
 * 只有水平手勢由 JS 處理。頁面已被放大時改回 auto 並停用 swipe，
 * 使用者才能正常水平平移放大後的畫面。
 *
 * click 在 capture 階段攔截：拖曳後放開仍會派送 click
 * （滑鼠從圖片拖到空白處時，目標是共同祖先），不擋會誤觸關閉。
 *
 * @param {import('vue').Ref<HTMLElement|null>} target
 * @param {{ canSwipe: (direction: 'left'|'right') => boolean,
 *           onSwipe: (direction: 'left'|'right') => void }} options
 *   direction 為手指移動方向：'left' 代表往左滑
 */
export function useSwipe(target, { canSwipe, onSwipe }) {
  const offsetX = ref(0)
  const isSwiping = ref(false)
  const isReturning = ref(false)

  let activePointerId = null
  let startX = 0
  let startY = 0
  let phase = 'idle' // 'idle' | 'pending' | 'dragging'
  let suppressClick = false
  let returnTimer = null
  let isZoomed = false

  const directionOf = (dx) => (dx < 0 ? 'left' : 'right')

  function onPointerDown(event) {
    // 拖曳中出現第二根手指：讓位給雙指縮放
    if (event.isPrimary === false) {
      if (phase !== 'idle') cancel()
      return
    }
    // 新的主要按壓代表上一次手勢早已結束；若當時沒收到 pointerup
    // （例如在視窗外放開），在此收尾，避免殘留狀態吞掉這次點擊
    if (phase !== 'idle') {
      offsetX.value = 0
      reset()
    }
    suppressClick = false
    if (isZoomed) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // 按在捲動容器本身（捲軸）上，不當成 swipe
    if (event.target === target.value) return

    activePointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    phase = 'pending'
    clearTimeout(returnTimer)
    isReturning.value = false

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
  }

  function onPointerMove(event) {
    if (event.pointerId !== activePointerId) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY

    if (phase === 'pending') {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_DISTANCE) return
      if (Math.abs(dx) > Math.abs(dy)) {
        phase = 'dragging'
        isSwiping.value = true
        suppressClick = true
      } else {
        // 判定為垂直捲動，整個手勢交還給瀏覽器
        reset()
        return
      }
    }

    offsetX.value = canSwipe(directionOf(dx)) ? dx : dx * EDGE_RESISTANCE
  }

  function onPointerUp(event) {
    if (event.pointerId !== activePointerId) return

    if (phase === 'dragging') {
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      const direction = directionOf(dx)

      if (
        Math.abs(dx) >= SWIPE_THRESHOLD &&
        Math.abs(dx) > Math.abs(dy) * DOMINANCE_RATIO &&
        canSwipe(direction)
      ) {
        // 瞬間歸位，新圖交給既有的淡入；不加彈回過渡，避免新圖從拖曳位置滑回來
        offsetX.value = 0
        onSwipe(direction)
      } else {
        springBack()
      }
    }

    finish()
  }

  function onPointerCancel(event) {
    if (event.pointerId !== activePointerId) return
    cancel()
  }

  function cancel() {
    if (phase === 'dragging') springBack()
    finish()
  }

  function finish() {
    reset()
    // click 在 pointerup 之後才派送，等它跑完再解除攔截
    setTimeout(() => {
      suppressClick = false
    }, 0)
  }

  function springBack() {
    clearTimeout(returnTimer)
    isReturning.value = true
    offsetX.value = 0
    returnTimer = setTimeout(() => {
      isReturning.value = false
    }, RETURN_DURATION)
  }

  function reset() {
    phase = 'idle'
    activePointerId = null
    isSwiping.value = false
    removeWindowListeners()
  }

  function removeWindowListeners() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
  }

  function onClickCapture(event) {
    if (!suppressClick) return
    event.preventDefault()
    event.stopPropagation()
  }

  function syncZoom() {
    const el = target.value
    if (!el) return

    isZoomed = (window.visualViewport?.scale ?? 1) > 1.01
    el.style.touchAction = isZoomed ? '' : TOUCH_ACTION
    if (isZoomed && phase !== 'idle') cancel()
  }

  onMounted(() => {
    const el = target.value
    if (!el) return

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('click', onClickCapture, true)
    syncZoom()
    window.visualViewport?.addEventListener('resize', syncZoom)
  })

  onBeforeUnmount(() => {
    const el = target.value
    el?.removeEventListener('pointerdown', onPointerDown)
    el?.removeEventListener('click', onClickCapture, true)
    window.visualViewport?.removeEventListener('resize', syncZoom)
    removeWindowListeners()
    clearTimeout(returnTimer)
  })

  return { offsetX, isSwiping, isReturning }
}
