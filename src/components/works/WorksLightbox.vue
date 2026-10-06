<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { largeSrc } from '@/data/works'
import { consumeLandingFlag } from '@/stores/worksRoute'
import { SWIPE_THRESHOLD, useSwipe } from '@/composables/useSwipe'
import LightboxThumbs from './LightboxThumbs.vue'

const props = defineProps({
  category: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const items = computed(() => props.category.items)
const activeIndex = ref(0)
const current = computed(() => items.value[activeIndex.value])

const isLoading = ref(true)
const isImageShown = ref(false)

const root = ref(null)
const scroller = ref(null)
const bar = ref(null)
const closeButton = ref(null)

// =============================================================
// 圖片載入
//
// 需求是「點下分類才開始載入」，這裡的做法：
//   - 轉圈圈只等「當前要看的那一張」，不等整批
//   - 其餘大圖在第一張顯示後於背景依序預抓
//
// 刻意不一次 fire 全部請求：CIS 有 24 張、平面有 21 張，
// 同時下載會互相搶頻寬，反而讓第一張更慢出現。
// =============================================================
const loadedSources = new Set()
let requestToken = 0
let isAlive = true

function preload(src) {
  if (loadedSources.has(src)) return Promise.resolve()

  return new Promise((resolve) => {
    const image = new Image()
    const done = () => {
      loadedSources.add(src)
      resolve()
    }
    image.onload = done
    image.onerror = done // 載入失敗也要讓流程繼續，不然會卡在轉圈圈
    image.src = src
  })
}

async function show(index) {
  if (index < 0 || index >= items.value.length) return

  const token = ++requestToken
  isImageShown.value = false
  isLoading.value = true

  // 先把圖解碼完才換 src，所以畫面上不會出現半張圖
  await preload(largeSrc(items.value[index].file))
  if (token !== requestToken || !isAlive) return

  activeIndex.value = index
  isLoading.value = false
  await nextTick()
  isImageShown.value = true

  // 換圖後回到頂端，長圖才不會接續上一張的捲動位置
  scroller.value?.scrollTo({ top: 0, behavior: 'instant' })
}

async function prefetchRemaining() {
  for (const item of items.value) {
    if (!isAlive) return
    await preload(largeSrc(item.file))
  }
}

// =============================================================
// 左右滑動
// =============================================================
// 切換仍走 show()，邊界、預載與淡入都跟按鈕一致
const { offsetX, isSwiping, isReturning } = useSwipe(scroller, {
  canSwipe: (direction) =>
    direction === 'left'
      ? activeIndex.value < items.value.length - 1
      : activeIndex.value > 0,
  onSwipe: (direction) =>
    show(activeIndex.value + (direction === 'left' ? 1 : -1)),
})

// =============================================================
// 點空白處關閉
//
// 不用 click：滑動後立刻點，觸控瀏覽器會把這一下當成「停止慣性」而不派送 click；
// 滑鼠點擊時手還在移動，也會被當成拖曳。改用 pointerdown / pointerup 自己判定，
// 只要按下與放開都在空白處、位移未達切換門檻，就算一次點擊。
// =============================================================
let backdropPress = null

function onStagePointerDown(event) {
  const isBackdrop = event.target === event.currentTarget
  const isMainButton = event.pointerType !== 'mouse' || event.button === 0
  backdropPress =
    isBackdrop && isMainButton && event.isPrimary
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : null
}

function onStagePointerUp(event) {
  const press = backdropPress
  backdropPress = null
  if (!press || event.pointerId !== press.id) return
  if (event.target !== event.currentTarget) return
  // 位移達門檻代表是滑動（已由 useSwipe 處理），不是點擊
  const distance = Math.hypot(event.clientX - press.x, event.clientY - press.y)
  if (distance >= SWIPE_THRESHOLD) return
  closeFromBackdrop()
}

function closeFromBackdrop() {
  // 瀏覽器之後仍可能派送這一下的 click；lightbox 移除後它會落到背後頁面，
  // 誤點到作品卡片等元素，所以短時間內攔掉一次
  const swallow = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  window.addEventListener('click', swallow, { capture: true, once: true })
  setTimeout(() => window.removeEventListener('click', swallow, true), 400)
  emit('close')
}

const swipeStyle = computed(() =>
  offsetX.value ? { transform: `translate3d(${offsetX.value}px, 0, 0)` } : undefined
)

// =============================================================
// 鍵盤操作
// =============================================================
function onKeydown(event) {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
    case 'ArrowLeft':
      event.preventDefault()
      show(activeIndex.value - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      show(activeIndex.value + 1)
      break
    case 'Tab':
      trapFocus(event)
      break
  }
}

// 焦點不能跑到 lightbox 背後的頁面上
function trapFocus(event) {
  const focusable = root.value?.querySelectorAll(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable?.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// =============================================================
// 背景頁面的捲動鎖定與還原
// =============================================================
let savedScrollY = 0
let wasOpenedFromUrl = false
let previouslyFocused = null
let barObserver = null

function syncBarHeight() {
  if (!root.value || !bar.value) return
  root.value.style.setProperty('--lb-bar-height', `${bar.value.offsetHeight}px`)
}

onMounted(() => {
  wasOpenedFromUrl = consumeLandingFlag()
  savedScrollY = window.scrollY
  previouslyFocused = document.activeElement

  // 掛在 document 而不是 lightbox 元素上：
  // 使用者點到沒有焦點的區域時，焦點會跑到 body，
  // 掛在元素上的 keydown 就收不到了
  document.addEventListener('keydown', onKeydown)

  // 鎖定前先量出捲軸寬度，給 body 補等寬 padding，
  // 這樣捲軸消失時背景內容不會橫向跳動
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${scrollbarWidth}px`
  )
  document.documentElement.classList.add('is-scroll-locked')

  // 說明文字可能換行，所以下方留白的高度要實際量測而不是寫死
  syncBarHeight()
  barObserver = new ResizeObserver(syncBarHeight)
  barObserver.observe(bar.value)

  closeButton.value?.focus()

  show(0).then(prefetchRemaining)
})

onBeforeUnmount(() => {
  isAlive = false
  barObserver?.disconnect()
  document.removeEventListener('keydown', onKeydown)
  document.documentElement.classList.remove('is-scroll-locked')
  document.documentElement.style.removeProperty('--scrollbar-width')

  // 若使用者是透過分享連結直接進站（?works=...），關閉後把他留在
  // 作品區塊，而不是莫名其妙的頁首
  const target = wasOpenedFromUrl
    ? (document.getElementById('works')?.getBoundingClientRect().top ?? 0) +
      window.scrollY
    : savedScrollY

  window.scrollTo({ top: target, behavior: 'instant' })
  previouslyFocused?.focus?.()
})
</script>

<template>
  <div
    ref="root"
    class="lightbox"
    role="dialog"
    aria-modal="true"
    :aria-label="`${category.title}：作品瀏覽`"
  >
    <!-- 大圖區：超過可視高度時由這一層負責捲動 -->
    <div
      ref="scroller"
      class="lightbox__scroll"
      :class="{ 'is-swiping': isSwiping }"
    >
      <!-- 只有在圖片以外的空白處按下並放開才關閉 -->
      <div
        class="lightbox__stage"
        @pointerdown="onStagePointerDown"
        @pointerup="onStagePointerUp"
        @pointercancel="backdropPress = null"
        @dragstart.prevent
      >
        <img
          v-show="!isLoading"
          class="lightbox__image"
          :class="{ 'is-shown': isImageShown, 'is-returning': isReturning }"
          :style="swipeStyle"
          :src="largeSrc(current.file)"
          :width="current.width"
          :height="current.height"
          :alt="current.caption"
          draggable="false"
        />
      </div>
    </div>

    <div v-if="isLoading" class="lightbox__loading" role="status">
      <span class="lightbox__spinner allow-motion"></span>
      <span class="visually-hidden">作品圖載入中</span>
    </div>

    <button
      ref="closeButton"
      class="lightbox__close"
      type="button"
      @click="emit('close')"
    >
      <span class="visually-hidden">關閉</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <button
      class="lightbox__arrow lightbox__arrow--prev"
      type="button"
      :disabled="activeIndex === 0"
      @click="show(activeIndex - 1)"
    >
      <span class="visually-hidden">上一張</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>

    <button
      class="lightbox__arrow lightbox__arrow--next"
      type="button"
      :disabled="activeIndex === items.length - 1"
      @click="show(activeIndex + 1)"
    >
      <span class="visually-hidden">下一張</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div ref="bar" class="lightbox__bar">
      <p class="lightbox__caption">{{ current.caption }}</p>
      <LightboxThumbs
        :items="items"
        :active-index="activeIndex"
        @select="show"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.lightbox {
  position: fixed;
  inset: 0;
  // iOS Safari 的網址列／工具列會蓋住 fixed 元素的底部，
  // 導致預覽圖條被遮掉一半。dvh 會隨工具列顯示或隱藏而調整。
  height: 100dvh;
  z-index: v.$z-lightbox;
  background: v.$color-lb-backdrop;

  // 由 JS 量測實際的說明文字＋預覽圖區高度後覆寫
  --lb-bar-height: 116px;
}

// -------------------------------------------------------------
// 大圖
// -------------------------------------------------------------
.lightbox__scroll {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  // 捲動區直接在底部扣掉說明文字＋預覽圖的高度。
  // 比在內容上加 padding-bottom 更直接：捲動範圍實際結束在
  // 預覽圖上緣，所以大圖永遠不會被它蓋住，捲軸也只出現在大圖區。
  bottom: var(--lb-bar-height);
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;

  // 捲軸：軌道透明、只留半透明灰的拉桿（對齊 參考資源/作品lightbox1.png）
  //
  // 兩組屬性必須互斥，不能同時寫在一起：
  // Chromium 只要看到 scrollbar-width 或 scrollbar-color 有非初始值，
  // 就會改用「原生捲軸」並忽略所有 ::-webkit-scrollbar 規則。
  // Windows 的原生捲軸自帶兩端的箭頭按鈕，而原生模式下沒有辦法關掉它們。
  //
  // 所以標準屬性只給不支援 ::-webkit-scrollbar 的引擎（Firefox），
  // 它的捲軸本來就沒有箭頭按鈕。
  @supports not selector(::-webkit-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: rgba(170, 172, 180, 0.5) transparent;
  }

  // Chromium / Safari 走自訂捲軸，箭頭按鈕明確關掉
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(170, 172, 180, 0.5);
    border-radius: 5px;
    // 用透明邊框把拉桿縮窄一點，看起來比較細緻
    border: 2px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(200, 202, 210, 0.7);
    background-clip: content-box;
  }

  // 拖曳中統一顯示抓取游標，蓋過 stage 的 zoom-out 與圖片的 default
  &.is-swiping,
  &.is-swiping * {
    cursor: grabbing;
  }
}

.lightbox__stage {
  display: flex;
  // 配合 min-height 與圖片的 margin:auto，達成
  //   圖比可視區小 → 上下置中
  //   圖比可視區大 → 從上緣開始，容器出現捲軸
  min-height: 100%;
  padding: v.$lb-pad;
  cursor: zoom-out;
  // 避免滑鼠拖曳時反白圖片
  user-select: none;

  @include m.mobile-down {
    padding: v.$lb-pad-mobile-y v.$lb-pad-mobile-x v.$lb-pad-mobile-x;
  }
}

.lightbox__image {
  // 用 margin:auto 而不是 align-items:center。
  // flex 的置中在內容溢出時會把頂端推到容器外、變成捲不到，
  // margin:auto 在空間不足時會自動退為 0，不會有這個問題。
  margin: auto;
  // 預設原尺寸；視窗不夠寬才縮到可用寬度
  width: auto;
  max-width: 100%;
  height: auto;
  opacity: 0;
  cursor: default;
  transition: opacity 0.25s ease;

  &.is-shown {
    opacity: 1;
  }

  // 未達門檻時彈回；時間需與 useSwipe 的 RETURN_DURATION 一致
  &.is-returning {
    transition: opacity 0.25s ease, transform 0.2s ease-out;
  }
}

// -------------------------------------------------------------
// 載入中
// -------------------------------------------------------------
.lightbox__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.lightbox__spinner {
  display: block;
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255, 255, 255, 0.22);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lb-spin 0.8s linear infinite;
}

@keyframes lb-spin {
  to {
    transform: rotate(360deg);
  }
}

// -------------------------------------------------------------
// 關閉與左右切換
// -------------------------------------------------------------
.lightbox__close {
  position: absolute;
  top: 0;
  // 往左讓開 10px 的捲軸，再留 4px 間隙
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 42px;
  background: v.$color-lb-close;
  color: #fff;
  border-bottom-left-radius: v.$radius;
  border-bottom-right-radius: v.$radius;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.15);
  }

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
  }
}

.lightbox__arrow {
  position: absolute;
  // 以「大圖區」的垂直中心為基準，而不是整個視窗，
  // 否則底部的預覽圖區會讓箭頭看起來偏低
  top: calc((100% - var(--lb-bar-height)) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 44px;
  margin-top: -22px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  transition: background-color 0.15s ease, opacity 0.15s ease;

  &--prev {
    left: 0;
    border-top-right-radius: v.$radius;
    border-bottom-right-radius: v.$radius;
  }

  &--next {
    right: 0;
    border-top-left-radius: v.$radius;
    border-bottom-left-radius: v.$radius;
  }

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.92);
  }

  &:disabled {
    opacity: 0.28;
    cursor: default;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

// -------------------------------------------------------------
// 底部：說明文字 + 預覽圖
// -------------------------------------------------------------
.lightbox__bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: v.$color-lb-bar;
}

.lightbox__caption {
  padding: 9px 16px 7px;
  color: v.$color-lb-caption;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  text-shadow: none;
}
</style>
