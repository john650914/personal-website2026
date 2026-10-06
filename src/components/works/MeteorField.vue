<script setup>
import { ref } from 'vue'
import { useParallaxAnchor } from '@/composables/useParallaxAnchor'

const front = ref(null)
const back = ref(null)

useParallaxAnchor(() => [front.value, back.value])
</script>

<template>
  <!--
    三層結構，為了讓兩種動作都只用 transform（不觸發重繪）：
      .meteor        600px 的框，overflow:hidden 負責裁切
      .meteor__shift 垂直視差（隨捲動）
      .meteor__strip 水平循環（CSS 動畫）

    舊站是用 background-position 做垂直視差、用 margin-left/margin-right
    做水平移動。前者每個 frame 都會讓整片背景重繪，後者會觸發 layout。
  -->
  <div ref="back" class="meteor meteor--back" aria-hidden="true">
    <div class="meteor__shift">
      <div class="meteor__strip"></div>
    </div>
  </div>

  <div ref="front" class="meteor meteor--front" aria-hidden="true">
    <div class="meteor__shift">
      <div class="meteor__strip"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.meteor {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  height: 600px;
  overflow: hidden;
  pointer-events: none;

  // 行動版不顯示（沿用舊站）
  @include m.tablet-down {
    display: none;
  }
}

.meteor--front {
  z-index: v.$z-meteor-front;
}

.meteor--back {
  z-index: v.$z-meteor-back;
}

// --- 垂直視差 ---
// 公式與舊站 parallax('0%', 0.7) / ('0%', 0.3) 相同
.meteor__shift {
  height: 100%;
  transform: translateY(
    calc((var(--anchor, 0px) - var(--scroll-y)) * var(--depth))
  );
  will-change: transform;
}

.meteor--front .meteor__shift {
  --depth: 0.7;
}

.meteor--back .meteor__shift {
  --depth: 0.3;
}

// --- 水平循環 ---
// 左右各多 960px，讓位移一個完整貼圖寬度的過程中畫面始終被填滿
.meteor__strip {
  width: calc(100% + 1920px);
  margin-left: -960px;
  background-repeat: repeat-x;
  background-position: 0 0;
  will-change: transform;
}

.meteor--front .meteor__strip {
  height: 293px;
  background-image: url('@/assets/img/meteor-front.png');
  // 位移量 = 貼圖寬度，所以循環接點完全看不出來
  animation: meteor-drift-left 60s linear infinite;
}

.meteor--back .meteor__strip {
  height: 163px;
  background-image: url('@/assets/img/meteor-back.png');
  animation: meteor-drift-right 110s linear infinite;
}

@keyframes meteor-drift-left {
  to {
    transform: translateX(-960px);
  }
}

@keyframes meteor-drift-right {
  to {
    transform: translateX(957px);
  }
}
</style>
