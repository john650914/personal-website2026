<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { thumbSrc } from '@/data/works'

const props = defineProps({
  items: { type: Array, required: true },
  activeIndex: { type: Number, required: true },
})

const emit = defineEmits(['select'])

const track = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

let resizeObserver = null

// =============================================================
// 滑鼠拖曳
//
// 刻意不用 setPointerCapture：Pointer Events 規範規定捕獲期間
// click 事件會被重新導向到「捕獲元素」，結果縮圖按鈕上的 @click
// 永遠不會觸發（這就是一開始點預覽圖沒反應的原因）。
// 改成把 move / up 掛在 window 上，click 就能正常派送到按鈕。
//
// 觸控不介入，交給瀏覽器原生的橫向捲動（慣性與邊界回彈都是免費的）。
// =============================================================
const DRAG_THRESHOLD = 6

let activePointerId = null
let dragDistance = 0
let startX = 0
let startScrollLeft = 0

function onPointerDown(event) {
  if (event.pointerType === 'touch' || event.button !== 0) return

  activePointerId = event.pointerId
  dragDistance = 0
  startX = event.clientX
  startScrollLeft = track.value.scrollLeft

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(event) {
  if (event.pointerId !== activePointerId) return

  const delta = event.clientX - startX
  dragDistance = Math.max(dragDistance, Math.abs(delta))

  if (dragDistance > DRAG_THRESHOLD) {
    track.value.scrollLeft = startScrollLeft - delta
  }
}

function onPointerUp(event) {
  if (event.pointerId !== activePointerId) return

  activePointerId = null
  removeDragListeners()

  // click 會在這之後才派送，所以要等它跑完才歸零，
  // 否則拖曳結束時會誤觸底下那張縮圖
  setTimeout(() => {
    dragDistance = 0
  }, 0)
}

function removeDragListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

function onSelect(index) {
  if (dragDistance > DRAG_THRESHOLD) return
  emit('select', index)
}

// =============================================================
// 左右翻頁
// =============================================================
function updateScrollState() {
  const el = track.value
  if (!el) return

  const max = el.scrollWidth - el.clientWidth
  // 留 1px 容錯，避免小數點讓按鈕閃現
  canScrollLeft.value = el.scrollLeft > 1
  canScrollRight.value = el.scrollLeft < max - 1
}

function scrollByPage(direction) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}

// 切換作品時把選中的縮圖帶進視野
watch(
  () => props.activeIndex,
  async () => {
    await nextTick()
    track.value
      ?.querySelector('.is-active')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }
)

onMounted(() => {
  updateScrollState()
  resizeObserver = new ResizeObserver(updateScrollState)
  resizeObserver.observe(track.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  removeDragListeners()
})
</script>

<template>
  <div class="lb-thumbs">
    <button
      v-show="canScrollLeft"
      class="lb-thumbs__page lb-thumbs__page--prev"
      type="button"
      @click="scrollByPage(-1)"
    >
      <span class="visually-hidden">預覽圖往左移動</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>

    <div
      ref="track"
      class="lb-thumbs__track"
      @pointerdown="onPointerDown"
      @scroll.passive="updateScrollState"
    >
      <ul class="lb-thumbs__list">
        <li v-for="(item, index) in items" :key="item.file">
          <button
            class="lb-thumbs__item"
            :class="{ 'is-active': index === activeIndex }"
            type="button"
            :aria-current="index === activeIndex ? 'true' : undefined"
            @click="onSelect(index)"
          >
            <img :src="thumbSrc(item.file)" alt="" draggable="false" />
            <span class="visually-hidden">{{ item.caption }}</span>
          </button>
        </li>
      </ul>
    </div>

    <button
      v-show="canScrollRight"
      class="lb-thumbs__page lb-thumbs__page--next"
      type="button"
      @click="scrollByPage(1)"
    >
      <span class="visually-hidden">預覽圖往右移動</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.lb-thumbs {
  position: relative;
  display: flex;
  align-items: center;
}

.lb-thumbs__track {
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 10px;
  overflow-x: auto;
  // 不要把捲動傳遞給背後的頁面
  overscroll-behavior-x: contain;
  cursor: grab;
  user-select: none;

  // 隱藏捲軸（拖曳與左右按鈕已經提供操作方式）
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }
}

// 數量少時整排置中，數量多時從最左邊開始並可左右捲動。
//
// 刻意不用 justify-content:center：在可捲動的容器上做置中，
// 內容溢出時開頭會被推到容器外而捲不到（跟大圖那個
// flex 置中陷阱是同一類問題）。
// width:max-content + margin-inline:auto 在空間不足時
// margin 會自動退為 0，兩種情況都正確。
.lb-thumbs__list {
  display: flex;
  gap: 6px;
  width: max-content;
  margin-inline: auto;

  // 預設不要收縮。
  // 全域 reset 有 img{max-width:100%}，如果 li 可以收縮，
  // 圖會跟著變窄、min-content 又跟著變小，形成「越縮越能縮」
  // 的循環，結果 24 張縮圖全部被壓成細長條。
  > li {
    flex: 0 0 auto;
  }
}

.lb-thumbs__item {
  display: block;
  padding: 0;
  // outline 不佔空間，所以選中時不會把其他縮圖推開
  outline: 2px solid transparent;
  outline-offset: -2px;
  opacity: 0.55;
  transition: opacity 0.2s ease, transform 0.2s ease, outline-color 0.2s ease;

  img {
    display: block;
    // 覆蓋全域 reset 的 max-width:100%，固定尺寸才不會被壓縮
    max-width: none;
    width: v.$lb-thumb-width;
    height: v.$lb-thumb-height;
    object-fit: cover;
    // 避免拖曳時觸發瀏覽器的圖片拖放
    pointer-events: none;

    @include m.mobile-down {
      width: v.$lb-thumb-width-mobile;
      height: v.$lb-thumb-height-mobile;
    }
  }

  &:hover {
    opacity: 0.85;
  }

  &.is-active {
    outline-color: #fff;
    opacity: 1;
    transform: scale(1.06);
  }
}

// 左右翻頁按鈕：只在該方向還有內容可捲時出現
.lb-thumbs__page {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;

  &--prev {
    left: 0;
  }

  &--next {
    right: 0;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.92);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
